"""
app.ml.data_generator
~~~~~~~~~~~~~~~~~~~~~
Generates clinically grounded medical datasets based on established
epidemiological distributions (CDC NHANES, Framingham, ADA, AHA, KDIGO, GOLD).
Provides realistic physiological correlations between biomarkers, lifestyle,
and reported symptoms across:
  - Type 2 Diabetes
  - Hypertension
  - Chronic Kidney Disease
  - COPD
  - Coronary Artery Disease
  - Healthy baseline
"""
import os
import numpy as np
import pandas as pd

from app.config import (
    DATA_DIR, N_SAMPLES, N_MULTI_SAMPLES, RANDOM_STATE,
    CLINICAL_SYMPTOMS, DISEASE_CLASSES,
)


def generate_datasets(n_samples: int = N_SAMPLES, seed: int = RANDOM_STATE) -> None:
    """Generate all disease datasets and write them to DATA_DIR."""
    os.makedirs(DATA_DIR, exist_ok=True)
    rng = np.random.default_rng(seed)

    _generate_comprehensive(rng, n_total=N_MULTI_SAMPLES)
    _generate_lifestyle(rng, n_samples)
    _generate_chronic(rng, n_samples)
    _generate_critical(rng, n_samples)

    print(f"[OK] Successfully generated clinical datasets in '{DATA_DIR}'.")


def _generate_comprehensive(rng: np.random.Generator, n_total: int = 6000) -> None:
    """
    Generate a 6-class comprehensive clinical cohort:
      0: Healthy / Low Risk
      1: Type 2 Diabetes
      2: Hypertension
      3: Chronic Kidney Disease
      4: COPD
      5: Coronary Artery Disease
    """
    n_per_class = max(100, n_total // len(DISEASE_CLASSES))
    rows = []

    for label_idx in DISEASE_CLASSES:
        for _ in range(n_per_class):
            age = float(rng.integers(22, 78))
            gender = int(rng.choice([0, 1]))

            # Baseline healthy priors
            bmi = float(rng.normal(23.5, 2.5))
            sbp = float(rng.normal(118.0, 7.0))
            dbp = float(rng.normal(76.0, 5.0))
            glucose = float(rng.normal(89.0, 8.0))
            chol = float(rng.normal(178.0, 18.0))
            smoking = int(rng.choice([0, 1], p=[0.78, 0.22]))
            exercise = float(rng.normal(3.8, 1.5))
            sleep = float(rng.normal(7.2, 0.9))
            alcohol = float(np.clip(rng.exponential(2.5), 0, 35))
            diet = float(rng.normal(6.8, 1.4))
            hr = float(rng.normal(72.0, 7.0))
            ecg = int(rng.choice([0, 1], p=[0.92, 0.08]))
            symptoms = {f"sym_{s}": 0 for s in CLINICAL_SYMPTOMS}

            if label_idx == 0:  # Healthy Baseline
                age = float(rng.integers(20, 55))
                bmi = float(np.clip(rng.normal(22.2, 1.8), 18.5, 25.0))
                sbp = float(np.clip(rng.normal(114.0, 5.0), 95.0, 122.0))
                dbp = float(np.clip(rng.normal(74.0, 4.0), 65.0, 80.0))
                glucose = float(np.clip(rng.normal(86.0, 6.0), 70.0, 99.0))
                chol = float(np.clip(rng.normal(172.0, 14.0), 135.0, 198.0))
                smoking = int(rng.choice([0, 1], p=[0.92, 0.08]))
                exercise = float(np.clip(rng.normal(4.8, 1.2), 2.5, 12.0))
                sleep = float(np.clip(rng.normal(7.6, 0.7), 6.5, 9.0))
                diet = float(np.clip(rng.normal(7.8, 1.0), 5.5, 10.0))
                ecg = 0
                if rng.random() < 0.12:
                    symptoms["sym_fatigue"] = 1

            elif label_idx == 1:  # Type 2 Diabetes (ADA: fasting glucose >= 126 mg/dL)
                age = float(np.clip(rng.normal(56.0, 9.5), 35.0, 82.0))
                glucose = float(np.clip(rng.normal(168.0, 32.0), 126.0, 320.0))
                bmi = float(np.clip(rng.normal(32.0, 4.2), 26.5, 46.0))
                sbp = float(np.clip(rng.normal(134.0, 11.0), 115.0, 175.0))
                dbp = float(np.clip(rng.normal(84.0, 7.0), 72.0, 105.0))
                exercise = float(np.clip(rng.normal(1.4, 0.9), 0.0, 3.5))
                diet = float(np.clip(rng.normal(3.8, 1.3), 1.0, 6.5))
                symptoms["sym_excessive_thirst"] = int(rng.choice([0, 1], p=[0.18, 0.82]))
                symptoms["sym_frequent_urination"] = int(rng.choice([0, 1], p=[0.14, 0.86]))
                symptoms["sym_fatigue"] = int(rng.choice([0, 1], p=[0.25, 0.75]))
                symptoms["sym_blurred_vision"] = int(rng.choice([0, 1], p=[0.50, 0.50]))
                symptoms["sym_weight_loss"] = int(rng.choice([0, 1], p=[0.70, 0.30]))

            elif label_idx == 2:  # Hypertension (AHA Stage 1 & 2: SBP >= 140 or DBP >= 90)
                age = float(np.clip(rng.normal(57.0, 10.0), 32.0, 82.0))
                sbp = float(np.clip(rng.normal(156.0, 15.0), 138.0, 215.0))
                dbp = float(np.clip(rng.normal(96.0, 8.0), 88.0, 125.0))
                bmi = float(np.clip(rng.normal(29.2, 3.6), 23.5, 40.0))
                alcohol = float(np.clip(rng.normal(13.5, 7.5), 2.0, 42.0))
                diet = float(np.clip(rng.normal(4.2, 1.4), 1.0, 7.5))
                symptoms["sym_headache"] = int(rng.choice([0, 1], p=[0.28, 0.72]))
                symptoms["sym_dizziness"] = int(rng.choice([0, 1], p=[0.38, 0.62]))
                symptoms["sym_palpitations"] = int(rng.choice([0, 1], p=[0.48, 0.52]))

            elif label_idx == 3:  # Chronic Kidney Disease (KDIGO: swelling, prolonged HTN/glucose)
                age = float(np.clip(rng.normal(63.0, 8.5), 40.0, 84.0))
                sbp = float(np.clip(rng.normal(148.0, 15.0), 126.0, 195.0))
                dbp = float(np.clip(rng.normal(91.0, 8.5), 75.0, 115.0))
                glucose = float(np.clip(rng.normal(132.0, 26.0), 92.0, 210.0))
                symptoms["sym_swelling"] = int(rng.choice([0, 1], p=[0.12, 0.88]))
                symptoms["sym_fatigue"] = int(rng.choice([0, 1], p=[0.14, 0.86]))
                symptoms["sym_frequent_urination"] = int(rng.choice([0, 1], p=[0.32, 0.68]))
                symptoms["sym_itching"] = int(rng.choice([0, 1], p=[0.48, 0.52]))
                symptoms["sym_nausea"] = int(rng.choice([0, 1], p=[0.58, 0.42]))

            elif label_idx == 4:  # COPD (GOLD: 90%+ smokers, cough, wheezing, dyspnea)
                age = float(np.clip(rng.normal(62.0, 8.0), 40.0, 85.0))
                smoking = 1
                exercise = float(np.clip(rng.normal(0.9, 0.6), 0.0, 2.5))
                symptoms["sym_cough"] = int(rng.choice([0, 1], p=[0.08, 0.92]))
                symptoms["sym_wheezing"] = int(rng.choice([0, 1], p=[0.10, 0.90]))
                symptoms["sym_shortness_of_breath"] = int(rng.choice([0, 1], p=[0.08, 0.92]))
                symptoms["sym_fatigue"] = int(rng.choice([0, 1], p=[0.35, 0.65]))

            elif label_idx == 5:  # Coronary Artery Disease (Framingham: cholesterol, chest pain, ECG)
                age = float(np.clip(rng.normal(61.0, 8.8), 38.0, 84.0))
                chol = float(np.clip(rng.normal(262.0, 32.0), 215.0, 370.0))
                sbp = float(np.clip(rng.normal(146.0, 16.0), 120.0, 195.0))
                hr = float(np.clip(rng.normal(86.0, 12.0), 64.0, 130.0))
                ecg = int(rng.choice([1, 2, 3, 4], p=[0.25, 0.40, 0.22, 0.13]))
                smoking = int(rng.choice([0, 1], p=[0.35, 0.65]))
                symptoms["sym_chest_pain"] = int(rng.choice([0, 1], p=[0.10, 0.90]))
                symptoms["sym_palpitations"] = int(rng.choice([0, 1], p=[0.28, 0.72]))
                symptoms["sym_shortness_of_breath"] = int(rng.choice([0, 1], p=[0.24, 0.76]))
                symptoms["sym_numbness"] = int(rng.choice([0, 1], p=[0.58, 0.42]))

            row = {
                "age": round(age, 1),
                "gender": gender,
                "bmi": round(bmi, 1),
                "systolic_bp": round(sbp, 1),
                "diastolic_bp": round(dbp, 1),
                "glucose": round(glucose, 1),
                "cholesterol": round(chol, 1),
                "smoking": smoking,
                "exercise_hours": round(exercise, 1),
                "sleep_hours": round(sleep, 1),
                "alcohol_units": round(alcohol, 1),
                "diet_score": round(diet, 1),
                "heart_rate": round(hr, 1),
                "ecg_events": ecg,
                **symptoms,
                "disease_target": label_idx,
            }
            rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(DATA_DIR / "comprehensive_clinical_dataset.csv", index=False)


# ── Lifestyle Dataset (Compatible with Gradio Lifestyle tab) ──────────────
def _generate_lifestyle(rng: np.random.Generator, n: int) -> None:
    age = rng.normal(55, 12, n)
    bmi = rng.normal(28, 5, n)
    sys_bp = rng.normal(128, 16, n)
    glucose = rng.normal(108, 28, n)
    resting_hr = rng.normal(72, 12, n)
    sleep_hours = rng.normal(6.5, 1.5, n)
    cholesterol = rng.normal(205, 42, n)

    # Clinical risk score grounded in AHA/ADA guidelines
    risk = (
        (glucose > 125).astype(float) * 2.5 +
        (sys_bp > 140).astype(float) * 2.0 +
        (bmi > 30).astype(float) * 1.5 +
        (cholesterol > 240).astype(float) * 1.2 +
        (age > 55).astype(float) * 0.8 -
        (sleep_hours >= 7).astype(float) * 0.5
    )
    y = (risk >= 2.0).astype(int)

    pd.DataFrame({
        "Age": np.round(age, 1),
        "BMI": np.round(bmi, 1),
        "Systolic_BP": np.round(sys_bp, 1),
        "Fasting_Glucose": np.round(glucose, 1),
        "Resting_HR": np.round(resting_hr, 1),
        "Sleep_Hours": np.round(sleep_hours, 1),
        "Cholesterol_Level": np.round(cholesterol, 1),
        "High_Risk": y,
    }).to_csv(DATA_DIR / "lifestyle_disease_dataset.csv", index=False)


# ── Chronic Dataset (Compatible with Gradio Chronic tab) ───────────────────
def _generate_chronic(rng: np.random.Generator, n: int) -> None:
    gfr = rng.normal(70, 22, n)
    creat = rng.normal(1.2, 0.45, n)
    smoking = rng.integers(0, 35, n)
    fev1 = rng.normal(2.5, 0.8, n)

    # CKD (GFR < 60, Creatinine > 1.4) or COPD (Smoking > 15, FEV1 < 2.0)
    ckd_risk = (gfr < 60) | (creat > 1.4)
    copd_risk = (smoking > 15) & (fev1 < 2.0)
    y = (ckd_risk | copd_risk).astype(int)

    pd.DataFrame({
        "GFR_Level": np.round(gfr, 1),
        "Creatinine": np.round(creat, 2),
        "Smoking_Years": smoking,
        "Lung_Capacity_FEV1": np.round(fev1, 2),
        "High_Risk": y,
    }).to_csv(DATA_DIR / "chronic_disease_dataset.csv", index=False)


# ── Critical Dataset (Compatible with Gradio Critical tab) ────────────────
def _generate_critical(rng: np.random.Generator, n: int) -> None:
    troponin = rng.normal(0.04, 0.025, n)
    max_hr = rng.normal(145, 22, n)
    chest_pain = rng.choice([0, 1, 2, 3], n, p=[0.45, 0.22, 0.20, 0.13])

    # Acute Coronary Syndrome risk: elevated troponin (>0.04) OR typical angina (type 2/3)
    acs_risk = (troponin > 0.04) | (chest_pain >= 2)
    y = acs_risk.astype(int)

    pd.DataFrame({
        "Troponin_Level": np.round(troponin, 3),
        "Max_HR": np.round(max_hr, 1),
        "Chest_Pain_Type": chest_pain,
        "High_Risk": y,
    }).to_csv(DATA_DIR / "critical_disease_dataset.csv", index=False)


if __name__ == "__main__":
    generate_datasets()
