
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("Warning: 'shap' library not found. Explainability layer will be skipped.")
    print("You can install it with: pip install shap")

def generate_synthetic_data(n_samples=1000):
    """
    Generates dummy patient data with lifestyle and vital signs.
    """
    np.random.seed(42)
    # Simulated features based on the Multi-Disease Design
    age = np.random.normal(55, 12, n_samples)
    bmi = np.random.normal(28, 5, n_samples)
    systolic_bp = np.random.normal(125, 15, n_samples)
    fasting_glucose = np.random.normal(105, 25, n_samples)
    resting_hr = np.random.normal(72, 12, n_samples)
    
    # Target Logic: 0 = Low/Medium Risk, 1 = High/Critical Risk
    # Higher values heavily increase the risk score
    risk_score = (age/50) + (bmi/25) + (systolic_bp/120) + (fasting_glucose/100)
    
    # Top 30% are considered High Risk
    threshold = np.percentile(risk_score, 70)
    y = (risk_score > threshold).astype(int)
    
    X = pd.DataFrame({
        'Age': np.round(age, 1),
        'BMI': np.round(bmi, 1),
        'Systolic_BP': np.round(systolic_bp, 1),
        'Fasting_Glucose': np.round(fasting_glucose, 1),
        'Resting_HR': np.round(resting_hr, 1)
    })
    
    return X, y

def train_and_evaluate_model():
    print("1. Loading 'Lifestyle Disease' patient dataset from CSV...")
    import os
    if not os.path.exists('data/lifestyle_disease_dataset.csv'):
        print("Warning: Dataset not found. Generating dynamically.")
        X, y = generate_synthetic_data(1500)
    else:
        df = pd.read_csv('data/lifestyle_disease_dataset.csv')
        X = df.drop(columns=['High_Risk'])
        y = df['High_Risk']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("2. Training the Stage 2 Risk Model (Random Forest)...")
    # Using a simple Random Forest as our classifier
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test)
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))
    
    return model, X_train, X_test

def explain_prediction(model, sample_input):
    """
    Demonstrates the Explainability Layer (Requirement #3) using SHAP values.
    """
    print("\n--- Model Explainability (XAI) ---")
    
    if not SHAP_AVAILABLE:
        print("Install SHAP to see feature attribution.")
        return

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample_input)
    
    # Extract the 1D SHAP values for class 1 (High Risk) safely across SHAP versions
    if isinstance(shap_values, list):
        impact_values = shap_values[1][0]
    elif len(np.shape(shap_values)) == 3:
        impact_values = shap_values[0, :, 1]
    else:
        impact_values = shap_values[0]
    
    print(f"Patient Input Data:\n{sample_input.iloc[0].to_dict()}")
    prediction = model.predict(sample_input)[0]
    prob = model.predict_proba(sample_input)[0]
    
    print(f"\nFinal Prediction: {'High Risk (Urgent)' if prediction == 1 else 'Low Risk (Routine)'}")
    print(f"Confidence Score: {prob[prediction] * 100:.2f}%")
    
    # Create a dataframe to show feature impact
    feature_names = sample_input.columns
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Impact (SHAP Value)': np.array(impact_values).flatten()
    }).sort_values(by='Impact (SHAP Value)', key=abs, ascending=False)
    
    print("\nFeature Contributors (Why did the model predict this?):")
    for _, row in importance_df.iterrows():
        direction = "Increased Risk" if row['Impact (SHAP Value)'] > 0 else "Decreased Risk"
        print(f" > {row['Feature']}: {direction} (weight: {abs(row['Impact (SHAP Value)']):.4f})")
        
    print("\nHuman-Readable Explanation:")
    top_feature = importance_df.iloc[0]['Feature']
    second_feature = importance_df.iloc[1]['Feature']
    print(f"\"The prediction was primarily driven by the patient's {top_feature} and {second_feature}.\"")

if __name__ == "__main__":
    trained_model, X_train_data, X_test_data = train_and_evaluate_model()
    
    # Pick a random high-risk patient from the test set to explain
    high_risk_indices = X_test_data.index[trained_model.predict(X_test_data) == 1]
    
    if len(high_risk_indices) > 0:
        sample_patient = X_test_data.loc[[high_risk_indices[0]]]
        explain_prediction(trained_model, sample_patient)
    else:
        print("No high-risk patients found in the test set to explain.")
