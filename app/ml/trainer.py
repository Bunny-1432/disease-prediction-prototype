"""
app.ml.trainer
~~~~~~~~~~~~~~
Handles dataset loading, XGBoost model training, and evaluation for:
  - MultiDisease: Comprehensive 6-class clinical diagnostic model
  - Lifestyle, Chronic, Critical: Focused single-category models
"""
from __future__ import annotations

import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from app.config import (
    DATA_REGISTRY, TARGET_COLUMN, MULTI_TARGET_COLUMN,
    MODEL_PARAMS, MULTI_MODEL_PARAMS, TEST_SIZE, RANDOM_STATE,
    DISEASE_CLASSES,
)
from app.ml.data_generator import generate_datasets


def load_data(category: str) -> tuple[pd.DataFrame, pd.Series]:
    """Load a dataset by category key. Auto-generates CSVs if missing."""
    path = DATA_REGISTRY.get(category)
    if path is None:
        raise ValueError(f"Unknown category '{category}'. Choose from: {list(DATA_REGISTRY)}")
    if not path.exists():
        print(f"[*] Dataset '{category}' not found at {path}. Auto-generating clinical datasets...")
        generate_datasets()
    df = pd.read_csv(path)

    target_col = MULTI_TARGET_COLUMN if category == "MultiDisease" else TARGET_COLUMN
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y


def train_category(category: str, verbose: bool = True) -> tuple[xgb.XGBClassifier, pd.DataFrame, pd.DataFrame]:
    """Train a binary XGBoost classifier for a specific disease category."""
    if verbose:
        print(f"\n[{category}] Loading dataset...")
    X, y = load_data(category)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    if verbose:
        print(f"[{category}] Training XGBoost ({len(X_train)} samples)...")
    model = xgb.XGBClassifier(**MODEL_PARAMS)
    model.fit(X_train, y_train)

    if verbose:
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"[{category}] Accuracy: {acc * 100:.2f}%")
        print(classification_report(y_test, y_pred, target_names=["Low Risk", "High Risk"]))

    return model, X_train, X_test


def train_multi_disease(verbose: bool = True) -> tuple[xgb.XGBClassifier, pd.DataFrame, pd.DataFrame]:
    """Train the comprehensive 6-class Multi-Disease diagnostic model."""
    if verbose:
        print("\n[MultiDisease] Loading comprehensive clinical dataset...")
    X, y = load_data("MultiDisease")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    if verbose:
        print(f"[MultiDisease] Training Multi-Class XGBoost ({len(X_train)} samples, 6 classes)...")
    model = xgb.XGBClassifier(**MULTI_MODEL_PARAMS)
    model.fit(X_train, y_train)

    if verbose:
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"[MultiDisease] Accuracy: {acc * 100:.2f}%")
        target_names = [DISEASE_CLASSES[i] for i in sorted(DISEASE_CLASSES)]
        print(classification_report(y_test, y_pred, target_names=target_names))

    return model, X_train, X_test


def train(category: str, verbose: bool = True):
    """Unified dispatcher for training by category key."""
    if category == "MultiDisease":
        return train_multi_disease(verbose=verbose)
    return train_category(category, verbose=verbose)


def train_all(verbose: bool = True) -> dict[str, xgb.XGBClassifier]:
    """Train all models (MultiDisease + category models) and return model registry dict."""
    print("[*] Initializing AI Engine -- pre-training multi-disease clinical models...")
    models = {}
    for cat in DATA_REGISTRY:
        models[cat] = train(cat, verbose=verbose)[0]
    print(f"[OK] Models ready: {list(models.keys())}")
    return models


if __name__ == "__main__":
    train_all(verbose=True)
