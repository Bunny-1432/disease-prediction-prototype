"""
Central configuration for the Disease Prediction system.
All dataset paths, hyperparameters, and clinical definitions live here.
"""
from pathlib import Path

# ── Project roots ──────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

# ── Dataset registry ───────────────────────────────────────────────────────
DATA_REGISTRY: dict[str, Path] = {
    "Lifestyle":     DATA_DIR / "lifestyle_disease_dataset.csv",
    "Chronic":       DATA_DIR / "chronic_disease_dataset.csv",
    "Critical":      DATA_DIR / "critical_disease_dataset.csv",
    "MultiDisease":  DATA_DIR / "comprehensive_clinical_dataset.csv",
}

COMPREHENSIVE_DATASET = DATA_REGISTRY["MultiDisease"]

# ── Target columns ─────────────────────────────────────────────────────────
TARGET_COLUMN = "High_Risk"
MULTI_TARGET_COLUMN = "disease_target"

# ── Disease taxonomy & mappings ───────────────────────────────────────────
DISEASE_CLASSES: dict[int, str] = {
    0: "Healthy",
    1: "Type 2 Diabetes",
    2: "Hypertension",
    3: "Chronic Kidney Disease",
    4: "COPD",
    5: "Coronary Artery Disease",
}

DISEASE_TO_CATEGORY: dict[str, str] = {
    "Healthy":                  "Lifestyle",
    "Type 2 Diabetes":          "Lifestyle",
    "Hypertension":             "Lifestyle",
    "Chronic Kidney Disease":   "Chronic",
    "COPD":                     "Chronic",
    "Coronary Artery Disease":  "Critical",
}

# ── 20 clinical symptoms captured by the frontend ─────────────────────────
CLINICAL_SYMPTOMS = [
    "fatigue", "chest_pain", "shortness_of_breath", "dizziness", "nausea",
    "headache", "fever", "blurred_vision", "frequent_urination", "excessive_thirst",
    "weight_gain", "weight_loss", "joint_pain", "itching", "cough", "wheezing",
    "swelling", "palpitations", "numbness", "abdominal_pain"
]

# ── ML hyperparameters ─────────────────────────────────────────────────────
MODEL_PARAMS: dict = {
    "n_estimators": 100,
    "max_depth": 5,
    "learning_rate": 0.1,
    "random_state": 42,
    "eval_metric": "logloss",
}

MULTI_MODEL_PARAMS: dict = {
    "n_estimators": 120,
    "max_depth": 5,
    "learning_rate": 0.08,
    "random_state": 42,
    "eval_metric": "mlogloss",
}

TEST_SIZE = 0.2
RANDOM_STATE = 42

# ── Data generation ────────────────────────────────────────────────────────
N_SAMPLES = 1500
N_MULTI_SAMPLES = 6000  # 1,000 per class across 6 classes

# ── UI / App ───────────────────────────────────────────────────────────────
APP_TITLE = "Next-Gen Multi-Disease Prediction Engine"
SHARE_PUBLIC = False
OPEN_IN_BROWSER = True
