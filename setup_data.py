import os
import numpy as np
import pandas as pd

def generate_datasets():
    os.makedirs('data', exist_ok=True)
    np.random.seed(42)
    n_samples = 1500

    # 1. Lifestyle Dataset (Upgraded)
    age = np.random.normal(55, 12, n_samples)
    bmi = np.random.normal(28, 5, n_samples)
    sys_bp = np.random.normal(125, 15, n_samples)
    glucose = np.random.normal(105, 25, n_samples)
    resting_hr = np.random.normal(72, 12, n_samples)
    sleep_hours = np.random.normal(6.5, 1.5, n_samples) # NEW 
    cholesterol = np.random.normal(200, 40, n_samples)  # NEW
    
    # Enhanced Risk Core logic: Low sleep and high cholesterol raise the risk
    risk_score = (age/50) + (bmi/25) + (sys_bp/120) + (glucose/100) + (cholesterol/150) - (sleep_hours/4)
    y_lifestyle = (risk_score > np.percentile(risk_score, 70)).astype(int)
    
    df_lifestyle = pd.DataFrame({
        'Age': np.round(age, 1),
        'BMI': np.round(bmi, 1),
        'Systolic_BP': np.round(sys_bp, 1),
        'Fasting_Glucose': np.round(glucose, 1),
        'Resting_HR': np.round(resting_hr, 1),
        'Sleep_Hours': np.round(sleep_hours, 1),
        'Cholesterol_Level': np.round(cholesterol, 1),
        'High_Risk': y_lifestyle
    })
    df_lifestyle.to_csv('data/lifestyle_disease_dataset.csv', index=False)
    
    # 2. Chronic Dataset
    gfr = np.random.normal(70, 20, n_samples)  
    creat = np.random.normal(1.2, 0.4, n_samples) 
    smoking = np.random.randint(0, 30, n_samples)
    fev1 = np.random.normal(2.5, 0.8, n_samples)
    risk_chronic = (creat*2) - (gfr/10) + (smoking/10) - (fev1)
    y_chronic = (risk_chronic > np.percentile(risk_chronic, 70)).astype(int)
    
    df_chronic = pd.DataFrame({
        'GFR_Level': np.round(gfr, 1),
        'Creatinine': np.round(creat, 2),
        'Smoking_Years': smoking,
        'Lung_Capacity_FEV1': np.round(fev1, 2),
        'High_Risk': y_chronic
    })
    df_chronic.to_csv('data/chronic_disease_dataset.csv', index=False)
    
    # 3. Critical Dataset (Cardiovascular)
    troponin = np.random.normal(0.04, 0.02, n_samples)
    max_hr = np.random.normal(150, 20, n_samples)
    chest_pain = np.random.choice([0, 1, 2, 3], n_samples, p=[0.5, 0.2, 0.2, 0.1])
    risk_crit = (troponin*100) + chest_pain - (max_hr/200)
    y_crit = (risk_crit > np.percentile(risk_crit, 85)).astype(int) 
    
    df_crit = pd.DataFrame({
        'Troponin_Level': np.round(troponin, 3),
        'Max_HR': np.round(max_hr, 1),
        'Chest_Pain_Type': chest_pain,
        'High_Risk': y_crit
    })
    df_crit.to_csv('data/critical_disease_dataset.csv', index=False)

    print("Successfully generated upgraded datasets with new features.")

if __name__ == "__main__":
    generate_datasets()
