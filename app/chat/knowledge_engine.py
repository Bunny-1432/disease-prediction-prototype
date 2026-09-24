"""
app.chat.knowledge_engine
~~~~~~~~~~~~~~~~~~~~~~~~~
Rule-based medical knowledge chatbot.
Previously an inline function in app.py.
Structured as a module so it can be swapped for an LLM-backed engine later.
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Knowledge base: keyword → response
# Ordered from most specific to most general.
# ---------------------------------------------------------------------------
_KB: list[tuple[tuple[str, ...], str]] = [
    (
        ("troponin", "cardiac", "heart attack", "myocardial"),
        "Elevated troponin is a key biomarker for myocardial injury. "
        "If troponin is acutely elevated alongside chest pain, seek emergency care immediately. "
        "Levels are monitored serially (0h / 3h / 6h) in clinical settings.",
    ),
    (
        ("chest pain", "angina", "palpitation"),
        "Chest pain with elevated troponin are critical acute symptoms. "
        "If you are experiencing this right now, call emergency services. "
        "For chronic angina, a cardiologist will evaluate with stress tests and imaging.",
    ),
    (
        ("critical", "emergency", "urgent"),
        "Critical disease risk requires urgent attention. "
        "Symptoms like severe chest pressure, shortness of breath, or sudden numbness "
        "warrant an immediate emergency department visit — do not wait.",
    ),
    (
        ("kidney", "ckd", "gfr", "creatinine", "renal"),
        "Chronic Kidney Disease (CKD) is staged by GFR. "
        "A GFR below 60 for more than 3 months indicates CKD. "
        "Elevated creatinine (>1.2 mg/dL in men, >1.0 in women) is an early warning sign. "
        "Always consult a nephrologist for actionable next steps.",
    ),
    (
        ("copd", "lung", "fev1", "respiratory", "breathing", "wheezing"),
        "COPD is assessed by spirometry — specifically FEV1 (forced expiratory volume). "
        "A FEV1/FVC ratio below 0.70 post-bronchodilator confirms obstruction. "
        "Smoking cessation is the single most effective intervention.",
    ),
    (
        ("chronic", "long-term", "persistent"),
        "Chronic conditions like CKD and COPD require continuous monitoring. "
        "Regular blood tests (GFR, creatinine) and spirometry help track disease progression. "
        "Always consult your specialist for personalised management plans.",
    ),
    (
        ("cholesterol", "ldl", "hdl", "lipid", "statin", "diet"),
        "High LDL cholesterol drives atherosclerotic plaque buildup. "
        "Target LDL: <100 mg/dL for most adults, <70 mg/dL for high-risk patients. "
        "A diet low in saturated fats and high in soluble fiber (oats, legumes) reduces LDL. "
        "Statins are the primary pharmacological intervention.",
    ),
    (
        ("glucose", "diabetes", "insulin", "blood sugar", "hba1c"),
        "Fasting glucose ≥126 mg/dL on two occasions confirms Type 2 Diabetes. "
        "HbA1c ≥6.5% is diagnostic. "
        "Lifestyle modification (diet + exercise) can prevent or delay progression in pre-diabetics.",
    ),
    (
        ("blood pressure", "hypertension", "systolic", "diastolic", "bp"),
        "Stage 1 Hypertension: SBP 130–139 or DBP 80–89 mmHg. "
        "Stage 2: SBP ≥140 or DBP ≥90 mmHg. "
        "DASH diet, weight loss, and reduced sodium are first-line lifestyle treatments. "
        "Antihypertensives (ACE inhibitors, ARBs) are added if lifestyle changes are insufficient.",
    ),
    (
        ("bmi", "obesity", "weight", "overweight"),
        "BMI ≥25 = Overweight, ≥30 = Obese. "
        "Each 5-unit increase in BMI raises cardiovascular risk by ~30%. "
        "Even a 5–10% weight loss significantly improves metabolic markers.",
    ),
    (
        ("sleep", "insomnia", "fatigue", "rest"),
        "Adequate sleep (7–9 hours) is essential for metabolic and cardiovascular health. "
        "Chronic sleep deprivation elevates cortisol, raises blood pressure, and impairs glucose regulation. "
        "Sleep apnea — often undiagnosed — is a strong independent risk factor for hypertension.",
    ),
    (
        ("exercise", "physical activity", "sedentary", "steps"),
        "The WHO recommends 150–300 min/week of moderate-intensity aerobic activity. "
        "Even 30 minutes of brisk walking 5 days/week significantly reduces cardiovascular risk. "
        "Resistance training 2×/week improves insulin sensitivity.",
    ),
    (
        ("smoking", "tobacco", "nicotine", "cigarette"),
        "Smoking is the leading preventable cause of disease globally. "
        "It doubles cardiovascular risk, accelerates CKD progression, and is the primary cause of COPD. "
        "Cessation at any age confers immediate and long-term benefits.",
    ),
]

_FALLBACK = (
    "I am the Multi-Disease AI Assistant. I can provide context on Lifestyle, "
    "Chronic, and Critical health metrics.\n\n"
    "Try asking about: cholesterol, blood pressure, sleep, diabetes, kidney disease, "
    "COPD, chest pain, smoking, BMI, or exercise."
)


def respond(message: str, history: list) -> str:  # noqa: ARG001
    """
    Match user message to knowledge base and return a response.
    `history` is accepted for Gradio ChatInterface compatibility but not used.
    """
    msg = message.lower()
    for keywords, reply in _KB:
        if any(kw in msg for kw in keywords):
            return reply
    return _FALLBACK
