"""
backend.schemas
~~~~~~~~~~~~~~~
Pydantic models for request/response validation.
Shapes must match exactly what the React frontend sends and expects.
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


# ── Prediction Request (from PredictionForm.jsx → buildPayload()) ─────────

class StructuredData(BaseModel):
    age: float = 40
    gender: str = "M"
    bmi: float = 22.0
    blood_pressure: str = "120/80"
    glucose: float = 90.0
    cholesterol: float = 180.0

class LifestyleData(BaseModel):
    smoking: bool = False
    exercise_hours_weekly: float = 3.0
    sleep_hours_nightly: float = 7.0
    alcohol_units_weekly: float = 0.0
    diet_quality_score: float = 5.0

class WearableData(BaseModel):
    avg_resting_heart_rate: int = 72
    abnormal_ecg_events: int = 0
    daily_steps: int = 5000

class PredictionRequest(BaseModel):
    user_id: str = "demo_user"
    structured_data: StructuredData = Field(default_factory=StructuredData)
    symptoms: list[str] = Field(default_factory=list)
    lifestyle_data: LifestyleData = Field(default_factory=LifestyleData)
    wearable_data: WearableData = Field(default_factory=WearableData)


# ── Prediction Response (consumed by ResultCard.jsx) ─────────────────────

class TopPrediction(BaseModel):
    disease: str
    confidence: float
    risk_score: int          # 0–100 integer for the gauge
    risk_tier: str           # Low | Medium | High | Critical

class Explainability(BaseModel):
    method: str = "SHAP"
    summary: str
    top_features: dict[str, float]   # { feature_name: shap_weight }

class BiomarkerRange(BaseModel):
    name: str
    unit: str
    normal: str
    borderline: str
    critical: str
    typical_value: float
    min_val: float = 0.0
    max_val: float = 100.0
    percentile: int = 50
    status: str = "Optimal"
    interpretation: str

class DiseaseStage(BaseModel):
    stage: int
    title: str
    severity: str
    criteria: str
    symptoms: str
    reversibility: str

class SymptomItem(BaseModel):
    sign: str
    mechanism: str
    urgency: str

class SymptomBreakdown(BaseModel):
    early_warning: list[SymptomItem] = Field(default_factory=list)
    acute_emergency: list[SymptomItem] = Field(default_factory=list)

class TargetOrgan(BaseModel):
    organ: str
    damage_mechanism: str
    risk_level: str

class ActionableItem(BaseModel):
    category: str
    action: str
    detail: str

class ActionableProtocol(BaseModel):
    dos: list[ActionableItem] = Field(default_factory=list)
    donts: list[ActionableItem] = Field(default_factory=list)

class DiagnosticTest(BaseModel):
    test: str
    frequency: str
    target: str
    importance: str

class ClinicalTrial(BaseModel):
    nct_id: str
    title: str
    phase: str = "N/A"
    status: str = "Active"
    sponsor: str = "Medical Center"
    url: str

class PubMedPaper(BaseModel):
    pmid: str
    title: str
    journal: str = "Medical Journal"
    pub_date: str = "Recent"
    url: str

class RealtimeFeed(BaseModel):
    last_synced_at: str
    next_sync_at: str
    source_apis: list[str] = Field(default_factory=lambda: ["ClinicalTrials.gov APIv2", "NCBI PubMed E-utilities"])
    clinical_trials: list[ClinicalTrial] = Field(default_factory=list)
    pubmed_research: list[PubMedPaper] = Field(default_factory=list)

class DiseaseProfile(BaseModel):
    name: str
    category: str
    description: str
    severity: str
    recommended_action: str
    types: list[str] = Field(default_factory=list)
    causes: list[str] = Field(default_factory=list)
    symptoms: list[str] = Field(default_factory=list)
    risk_factors: list[str] = Field(default_factory=list)
    diagnostic_methods: list[str] = Field(default_factory=list)
    treatment_options: list[str] = Field(default_factory=list)
    prevention_strategies: list[str] = Field(default_factory=list)
    possible_complications: list[str] = Field(default_factory=list)

    # Point-by-point visual elements
    biomarkers: list[BiomarkerRange] = Field(default_factory=list)
    stages: list[DiseaseStage] = Field(default_factory=list)
    symptoms_breakdown: Optional[SymptomBreakdown] = None
    target_organs: list[TargetOrgan] = Field(default_factory=list)
    actionable_protocol: Optional[ActionableProtocol] = None
    diagnostic_tests: list[DiagnosticTest] = Field(default_factory=list)
    realtime_feed: Optional[RealtimeFeed] = None

class PredictionResponse(BaseModel):
    prediction_id: str
    timestamp: str
    category: str
    top_predictions: list[TopPrediction]
    explainability: Explainability
    disease_profile: Optional[DiseaseProfile]
    disclaimer: str = (
        "This tool provides risk estimations only and is NOT a clinical diagnosis. "
        "Always consult a qualified healthcare provider."
    )


# ── User History (consumed by Dashboard.jsx) ─────────────────────────────

class HistoryRecord(BaseModel):
    prediction_id: str
    timestamp: str
    top_disease: str
    risk_tier: str
    risk_score: int

class UserHistoryResponse(BaseModel):
    user_id: str
    total_records: int
    records: list[HistoryRecord]

class RiskAnalysisResponse(BaseModel):
    user_id: str
    average_risk_score: float
    current_trend: str       # Improving | Worsening | Stable
    highest_risk_tier: str


# ── Disease Knowledge (consumed by Dashboard.jsx + DiseaseInfoPage.jsx) ───

class DiseaseSummary(BaseModel):
    name: str
    category: str
    severity: Optional[str] = None
    description: Optional[str] = None

class KnowledgeBaseSyncStatus(BaseModel):
    last_synced_at: Optional[str] = None
    next_sync_at: Optional[str] = None
    sync_interval_hours: int = 24
    status: str = "synced"
    total_diseases: int = 6
    is_syncing: bool = False

class DiseaseListResponse(BaseModel):
    diseases: list[DiseaseSummary]
    sync_status: Optional[KnowledgeBaseSyncStatus] = None
