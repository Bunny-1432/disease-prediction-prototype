"""
app.ml.explainer
~~~~~~~~~~~~~~~~
SHAP-based explainability layer.
Previously embedded in sample_model.py alongside training code.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import xgboost as xgb

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠️  'shap' not installed. Explainability layer will be skipped.")


def explain(model: xgb.XGBClassifier, sample: pd.DataFrame, verbose: bool = True) -> dict | None:
    """
    Generate SHAP feature attributions for a single patient sample.

    Returns a dict with keys:
        prediction, confidence, feature_impacts (sorted DataFrame), summary (str)
    or None if SHAP is unavailable.
    """
    if not SHAP_AVAILABLE:
        if verbose:
            print("Install shap (`pip install shap`) to enable explainability.")
        return None

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample)

    # Normalise across XGBoost output shapes
    if isinstance(shap_values, list):
        impact = shap_values[1][0]
    elif len(np.shape(shap_values)) == 3:
        impact = shap_values[0, :, 1]
    else:
        impact = shap_values[0]

    pred = int(model.predict(sample)[0])
    prob = model.predict_proba(sample)[0]

    importance = (
        pd.DataFrame({
            "Feature": sample.columns,
            "SHAP_Value": np.array(impact).flatten(),
        })
        .assign(Direction=lambda df: df["SHAP_Value"].apply(
            lambda v: "↑ Increased Risk" if v > 0 else "↓ Decreased Risk"
        ))
        .reindex(columns=["Feature", "SHAP_Value", "Direction"])
        .sort_values("SHAP_Value", key=abs, ascending=False)
        .reset_index(drop=True)
    )

    top = importance.iloc[0]
    second = importance.iloc[1] if len(importance) > 1 else None
    summary = (
        f"Prediction driven by '{top['Feature']}'"
        + (f" and '{second['Feature']}'" if second is not None else "")
        + "."
    )

    if verbose:
        label = "🚨 High Risk" if pred == 1 else "✅ Low Risk"
        print(f"\nPrediction: {label}  |  Confidence: {prob[pred] * 100:.2f}%")
        print("\nFeature Attributions:")
        for _, row in importance.iterrows():
            print(f"  {row['Direction']}  {row['Feature']}: {abs(row['SHAP_Value']):.4f}")
        print(f"\nSummary: {summary}")

    return {
        "prediction": pred,
        "confidence": prob[pred],
        "feature_impacts": importance,
        "summary": summary,
    }
