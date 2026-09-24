"""
backend.api.predict
~~~~~~~~~~~~~~~~~~~
POST /api/v1/predict
Accepts multi-modal health data from PredictionForm.jsx, runs the comprehensive
MultiDisease XGBoost inference engine across 5 target diseases + Healthy baseline,
and returns the full result expected by ResultCard.jsx.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from app.ml.predictor import predict_multi_disease
from backend.schemas import (
    PredictionRequest, PredictionResponse,
    TopPrediction, Explainability, DiseaseProfile,
)
from backend.api.user import save_prediction

router = APIRouter()

# ── Injected at startup by main.py ────────────────────────────────────────
_models: dict = {}

def set_models(models: dict) -> None:
    global _models
    _models = models


def _get_profile(name: str) -> DiseaseProfile | None:
    """Fetch disease profile from the synchronized 24-hour dynamic knowledge cache."""
    from backend.services.knowledge_updater import load_cached_knowledge
    cache = load_cached_knowledge()
    disease_map = cache.get("diseases", {})

    d = disease_map.get(name)
    matched_name = name
    if not d:
        if "Healthy" in name:
            d = disease_map.get("Healthy / Optimal Baseline")
            matched_name = "Healthy / Optimal Baseline"
        else:
            for k, v in disease_map.items():
                if k.lower() == name.lower() or name.lower() in k.lower():
                    d = v
                    matched_name = k
                    break

    if not d:
        return None

    profile_dict = dict(d)
    profile_dict.pop("name", None)
    return DiseaseProfile(name=matched_name, **profile_dict)


@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    s = req.structured_data
    l = req.lifestyle_data
    w = req.wearable_data

    # Parse Blood Pressure "140/90" → systolic 140, diastolic 90
    bp_parts = s.blood_pressure.split("/") if "/" in s.blood_pressure else [s.blood_pressure, "80"]
    try:
        sys_bp = float(bp_parts[0])
    except ValueError:
        sys_bp = 120.0
    try:
        dia_bp = float(bp_parts[1]) if len(bp_parts) > 1 else 80.0
    except ValueError:
        dia_bp = 80.0

    # Retrieve MultiDisease model
    model = _models.get("MultiDisease")
    if model is None:
        # Fallback if startup training is still in progress
        from app.ml.trainer import train_multi_disease
        model = train_multi_disease(verbose=False)[0]
        _models["MultiDisease"] = model

    # ── Run Multi-Disease Clinical Inference ───────────────────────────────
    res = predict_multi_disease(
        model=model,
        age=s.age,
        gender=s.gender,
        bmi=s.bmi,
        systolic_bp=sys_bp,
        diastolic_bp=dia_bp,
        glucose=s.glucose,
        cholesterol=s.cholesterol,
        smoking=l.smoking,
        exercise_hours=l.exercise_hours_weekly,
        sleep_hours=l.sleep_hours_nightly,
        alcohol_units=l.alcohol_units_weekly,
        diet_score=l.diet_quality_score,
        heart_rate=w.avg_resting_heart_rate,
        ecg_events=w.abnormal_ecg_events,
        symptoms_list=req.symptoms,
    )

    primary_disease = res["primary_disease"]
    category        = res["category"]
    risk_score      = res["risk_score"]
    risk_tier       = res["risk_tier"]
    conf_value      = res["primary_confidence"]
    features        = res["feature_contributions"]

    # Map display name for disease profile
    if primary_disease == "Healthy":
        display_name = "Healthy / Optimal Baseline"
    else:
        display_name = primary_disease

    # Build TopPredictions list (Primary + secondary differentials)
    top_preds = []
    for p in res["ranked_predictions"]:
        p_name = "Healthy / Optimal Baseline" if p["disease"] == "Healthy" else p["disease"]
        top_preds.append(TopPrediction(
            disease=p_name,
            confidence=p["confidence"],
            risk_score=p["risk_score"],
            risk_tier=p["risk_tier"],
        ))

    # Composed clinical XAI summary
    top_feats = list(features.keys())
    feat_1 = top_feats[0].replace("symptom_", "").replace("_", " ") if len(top_feats) > 0 else "vitals"
    feat_2 = top_feats[1].replace("symptom_", "").replace("_", " ") if len(top_feats) > 1 else "lifestyle baseline"

    if primary_disease == "Healthy":
        summary = (
            f"Overall health assessment indicates an optimal baseline (Risk {risk_score}/100, {risk_tier}). "
            f"Vitals and laboratory parameters are well within normative clinical ranges."
        )
    else:
        summary = (
            f"Primary clinical indication: {primary_disease} ({conf_value*100:.1f}% confidence). "
            f"Risk calculation ({risk_score}/100, {risk_tier}) is predominantly influenced by elevated {feat_1} "
            f"and {feat_2} relative to standard clinical guidelines."
        )

    prediction_id = f"pred_{uuid.uuid4().hex[:8]}"
    timestamp     = datetime.now(timezone.utc).isoformat()

    # ── Persist to in-memory history ──────────────────────────────────────
    save_prediction(req.user_id, {
        "prediction_id": prediction_id,
        "timestamp":     timestamp,
        "top_disease":   display_name,
        "risk_tier":     risk_tier,
        "risk_score":    risk_score,
    })

    profile = _get_profile(display_name)
    if profile is None and primary_disease != "Healthy":
        profile = _get_profile(primary_disease)

    return PredictionResponse(
        prediction_id=prediction_id,
        timestamp=timestamp,
        category=category,
        top_predictions=top_preds,
        explainability=Explainability(
            summary=summary,
            top_features=features,
        ),
        disease_profile=profile,
    )
