import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("Warning: 'shap' library not found. Explainability layer will be skipped.")

DATA_REGISTRY = {
    'Lifestyle': 'data/lifestyle_disease_dataset.csv',
    'Chronic': 'data/chronic_disease_dataset.csv',
    'Critical': 'data/critical_disease_dataset.csv'
}

import setup_data

def load_data(category):
    file_path = DATA_REGISTRY.get(category)
    if not file_path or not os.path.exists(file_path):
        print(f"Dataset for {category} not found at {file_path}. Auto-generating all datasets now...")
        setup_data.generate_datasets()
        
    df = pd.read_csv(file_path)
    X = df.drop(columns=['High_Risk'])
    y = df['High_Risk']
    return X, y

def train_and_evaluate_model(category='Lifestyle'):
    print(f"1. Loading '{category}' patient dataset from CSV...")
    X, y = load_data(category)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"2. Training the {category} Risk Model (XGBoost)...")
    # Using XGBoost for tabular medical data as industry standard
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric='logloss')
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
    Demonstrates Explainability (XAI) using SHAP values on XGBoost.
    """
    print("\n--- Model Explainability (XAI) ---")
    
    if not SHAP_AVAILABLE:
        print("Install SHAP to see feature attribution.")
        return

    # XGBoost Explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample_input)
    
    # XGBoost shap_values shape for binary classification is usually (n_samples, n_features)
    if isinstance(shap_values, list):
        impact_values = shap_values[1][0]
    elif len(np.shape(shap_values)) == 3:
        impact_values = shap_values[0, :, 1]
    else:
        # Standard 2D output from TreeExplainer on XGBClassifier
        impact_values = shap_values[0]
    
    print(f"Patient Input Data:\n{sample_input.iloc[0].to_dict()}")
    prediction = int(model.predict(sample_input)[0])
    prob = model.predict_proba(sample_input)[0]
    
    print(f"\nFinal Prediction: {'🚨 High Risk (Urgent)' if prediction == 1 else '✅ Low Risk (Routine)'}")
    print(f"Confidence Score: {prob[prediction] * 100:.2f}%")
    
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
    # Test all models to verify pipeline stability
    for category in DATA_REGISTRY.keys():
        trained_model, X_train_data, X_test_data = train_and_evaluate_model(category)
        
        # Pick a random high-risk patient from the test set to explain
        high_risk_indices = X_test_data.index[trained_model.predict(X_test_data) == 1]
        
        if len(high_risk_indices) > 0:
            sample_patient = X_test_data.loc[[high_risk_indices[0]]]
            explain_prediction(trained_model, sample_patient)
        print("="*60)
