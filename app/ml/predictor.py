"""
app.ml.predictor
~~~~~~~~~~~~~~~~
Inference wrappers for both:
  1. MultiDisease: Unified clinical diagnostic engine across 5 conditions + Healthy baseline.
  2. Legacy category endpoints: predict_lifestyle, predict_chronic, predict_critical (for Gradio tabs).
"""
from __future__ import annotations

import pandas as pd
import numpy as np
import xgboost as xgb

from app.config import CLINICAL_SYMPTOMS, DISEASE_CLASSES, DISEASE_TO_CATEGORY


def _to_tier(score: int) -> str:
    if score < 30:
        return "Low"
    if score < 55:
        return "Medium"
    if score < 80:
        return "High"
    return "Critical"


def predict_multi_disease(
    model: xgb.XGBClassifier,
    age: float,
    gender: str | int,
    bmi: float,
    systolic_bp: float,
    diastolic_bp: float,
    glucose: float,
    cholesterol: float,
    smoking: bool | int,
    exercise_hours: float,
    sleep_hours: float,
    alcohol_units: float,
    diet_score: float,
    heart_rate: float,
    ecg_events: int,
    symptoms_list: list[str],
) -> dict:
    """
    Evaluates patient data against the 6-class MultiDisease XGBoost model.
    Returns primary diagnosis, full differential probability distribution,
    calibrated clinical risk score (0-100), risk tier, and feature attributions.
    """
    g_val = 1 if gender in (1, "M", "Male", "m", "male") else 0
    smk_val = 1 if smoking in (1, True, "true", "True", "yes", "Yes") else 0

    clean_symptoms = [s.lower().replace(" ", "_") for s in symptoms_list]
    sym_dict = {f"sym_{s}": (1 if s in clean_symptoms else 0) for s in CLINICAL_SYMPTOMS}

    row = {
        "age": float(age),
        "gender": g_val,
        "bmi": float(bmi),
        "systolic_bp": float(systolic_bp),
        "diastolic_bp": float(diastolic_bp),
        "glucose": float(glucose),
        "cholesterol": float(cholesterol),
        "smoking": smk_val,
        "exercise_hours": float(exercise_hours),
        "sleep_hours": float(sleep_hours),
        "alcohol_units": float(alcohol_units),
        "diet_score": float(diet_score),
        "heart_rate": float(heart_rate),
        "ecg_events": int(ecg_events),
        **sym_dict,
    }

    input_df = pd.DataFrame([row])
    probs = model.predict_proba(input_df)[0]
    best_class_idx = int(np.argmax(probs))
    best_disease = DISEASE_CLASSES[best_class_idx]
    best_prob = float(probs[best_class_idx])

    # Class probabilities dictionary
    class_probs = {DISEASE_CLASSES[i]: round(float(p), 4) for i, p in enumerate(probs)}

    # Calibrated Clinical Risk Score (0-100) based on medical thresholds
    if best_disease == "Healthy":
        # Check mild deviation
        bp_dev = max(0.0, (systolic_bp - 120.0) / 40.0)
        gluc_dev = max(0.0, (glucose - 99.0) / 50.0)
        bmi_dev = max(0.0, (bmi - 25.0) / 15.0)
        chol_dev = max(0.0, (cholesterol - 200.0) / 80.0)
        sym_count = len(symptoms_list)
        base_score = int(round(12 + bp_dev * 15 + gluc_dev * 15 + bmi_dev * 10 + chol_dev * 10 + sym_count * 2))
        risk_score = min(29, max(5, base_score))
        risk_tier = "Low"
        category = "Lifestyle"

    elif best_disease == "Hypertension":
        # AHA Criteria: Stage 1 = 130-139/80-89, Stage 2 = >=140/>=90, Crisis = >=180/>=120
        if systolic_bp >= 180 or diastolic_bp >= 120:
            risk_score = min(99, int(round(90 + (systolic_bp - 180) * 0.4)))
        elif systolic_bp >= 140 or diastolic_bp >= 90:
            risk_score = min(88, int(round(70 + (systolic_bp - 140) * 0.4 + (diastolic_bp - 90) * 0.3)))
        elif systolic_bp >= 130 or diastolic_bp >= 80:
            risk_score = min(68, int(round(50 + (systolic_bp - 130) * 1.5)))
        else:
            risk_score = int(round(40 * best_prob))
        risk_score = max(35, min(98, risk_score))
        risk_tier = _to_tier(risk_score)
        category = "Lifestyle"

    elif best_disease == "Type 2 Diabetes":
        # ADA Criteria: Fasting glucose >= 126 is diabetic, >=180 is severe
        if glucose >= 200:
            risk_score = min(98, int(round(88 + (glucose - 200) * 0.08 + (bmi - 30) * 0.3)))
        elif glucose >= 126:
            risk_score = min(85, int(round(68 + (glucose - 126) * 0.22 + (bmi - 25) * 0.4)))
        elif glucose >= 100:
            risk_score = min(60, int(round(45 + (glucose - 100) * 0.6)))
        else:
            risk_score = int(round(35 * best_prob))
        risk_score = max(35, min(98, risk_score))
        risk_tier = _to_tier(risk_score)
        category = "Lifestyle"

    elif best_disease == "Coronary Artery Disease":
        # Framingham Criteria: chest pain + cholesterol + ECG + SBP
        base = 72
        if "chest_pain" in clean_symptoms:
            base += 12
        if ecg_events >= 1:
            base += min(10, ecg_events * 3)
        if cholesterol >= 240:
            base += 6
        risk_score = max(60, min(98, int(round(base * best_prob + 10))))
        risk_tier = _to_tier(risk_score)
        category = "Critical"

    elif best_disease == "COPD":
        # GOLD Criteria: smoking + cough + wheezing + shortness of breath
        base = 70
        if smk_val == 1:
            base += 12
        if "wheezing" in clean_symptoms:
            base += 6
        if "shortness_of_breath" in clean_symptoms:
            base += 6
        risk_score = max(55, min(95, int(round(base * best_prob + 5))))
        risk_tier = _to_tier(risk_score)
        category = "Chronic"

    elif best_disease == "Chronic Kidney Disease":
        # KDIGO Criteria: edema/swelling + high BP/glucose
        base = 68
        if "swelling" in clean_symptoms:
            base += 14
        if systolic_bp >= 140:
            base += 8
        if "fatigue" in clean_symptoms:
            base += 5
        risk_score = max(55, min(96, int(round(base * best_prob + 6))))
        risk_tier = _to_tier(risk_score)
        category = "Chronic"

    else:
        risk_score = int(round(best_prob * 100))
        risk_tier = _to_tier(risk_score)
        category = DISEASE_TO_CATEGORY.get(best_disease, "Lifestyle")

    # Ranked differential list
    ranked_indices = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
    ranked_predictions = []
    for idx in ranked_indices:
        d_name = DISEASE_CLASSES[idx]
        d_prob = round(float(probs[idx]), 3)
        if d_name == best_disease:
            ranked_predictions.append({
                "disease": d_name,
                "confidence": d_prob,
                "risk_score": risk_score,
                "risk_tier": risk_tier,
            })
        else:
            # Secondary differential estimated risk
            diff_score = max(5, int(round(d_prob * risk_score * 0.9)))
            ranked_predictions.append({
                "disease": d_name,
                "confidence": d_prob,
                "risk_score": diff_score,
                "risk_tier": _to_tier(diff_score),
            })

    # Normalized feature contributions based on deviation from healthy normative baselines
    deviations = {
        "fasting_glucose": round(max(0.0, (glucose - 90.0) / 180.0), 3),
        "systolic_bp":    round(max(0.0, (systolic_bp - 120.0) / 70.0), 3),
        "cholesterol":    round(max(0.0, (cholesterol - 180.0) / 180.0), 3),
        "bmi":            round(max(0.0, (bmi - 23.0) / 20.0), 3),
        "resting_hr":     round(max(0.0, (heart_rate - 72.0) / 60.0), 3),
        "ecg_events":     round(min(1.0, ecg_events / 4.0), 3),
        "smoking":        1.0 if smk_val else 0.0,
        "sleep_deficit":  round(max(0.0, (7.5 - sleep_hours) / 5.0), 3),
        "exercise_deficit": round(max(0.0, (4.0 - exercise_hours) / 4.0), 3),
    }

    # Add symptom impacts if present
    for sym in clean_symptoms:
        deviations[f"symptom_{sym}"] = 0.85

    # Filter only positive deviations, sort, and normalize
    active_features = {k: v for k, v in deviations.items() if v > 0.05}
    if not active_features:
        active_features = {"normal_vitals": 0.05, "routine_biomarkers": 0.04}

    total_w = sum(active_features.values())
    feature_contributions = {
        k: round(v / total_w, 3) for k, v in sorted(active_features.items(), key=lambda x: x[1], reverse=True)[:6]
    }

    return {
        "primary_disease": best_disease,
        "primary_confidence": round(best_prob, 3),
        "category": category,
        "risk_score": risk_score,
        "risk_tier": risk_tier,
        "class_probabilities": class_probs,
        "ranked_predictions": ranked_predictions[:3],
        "feature_contributions": feature_contributions,
    }


# ── Backward-Compatible Legacy Wrappers for Gradio Tabs ───────────────────
def _run_binary(model: xgb.XGBClassifier, input_df: pd.DataFrame) -> tuple[str, str]:
    pred = int(model.predict(input_df)[0])
    prob = model.predict_proba(input_df)[0]
    risk = "🚨 HIGH RISK (Urgent Clinical Evaluation Advised)" if pred == 1 else "✅ LOW RISK (Routine Monitoring)"
    confidence = f"{prob[pred] * 100:.2f}% System Confidence"
    return risk, confidence


def predict_lifestyle(
    model: xgb.XGBClassifier,
    age: float,
    bmi: float,
    sys_bp: float,
    glucose: float,
    heart_rate: float,
    sleep: float,
    cholesterol: float,
) -> tuple[str, str]:
    df = pd.DataFrame([{
        "Age": age, "BMI": bmi, "Systolic_BP": sys_bp,
        "Fasting_Glucose": glucose, "Resting_HR": heart_rate,
        "Sleep_Hours": sleep, "Cholesterol_Level": cholesterol,
    }])
    return _run_binary(model, df)


def predict_chronic(
    model: xgb.XGBClassifier,
    gfr: float,
    creatinine: float,
    smoking_years: float,
    fev1: float,
) -> tuple[str, str]:
    df = pd.DataFrame([{
        "GFR_Level": gfr, "Creatinine": creatinine,
        "Smoking_Years": smoking_years, "Lung_Capacity_FEV1": fev1,
    }])
    return _run_binary(model, df)


def predict_critical(
    model: xgb.XGBClassifier,
    troponin: float,
    max_hr: float,
    chest_pain_raw: str | int,
) -> tuple[str, str]:
    chest_pain = int(str(chest_pain_raw).split(" ")[0])
    df = pd.DataFrame([{
        "Troponin_Level": troponin,
        "Max_HR": max_hr,
        "Chest_Pain_Type": chest_pain,
    }])
    return _run_binary(model, df)
