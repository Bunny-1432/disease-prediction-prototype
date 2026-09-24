"""
backend.api.user
~~~~~~~~~~~~~~~~
User history and risk analysis endpoints.
Uses in-memory store (per-process) — sufficient for the prototype.
GET /api/v1/user/{user_id}/history
GET /api/v1/user/{user_id}/risk-analysis
"""
from fastapi import APIRouter
from backend.schemas import UserHistoryResponse, RiskAnalysisResponse, HistoryRecord

router = APIRouter()

# In-memory store: user_id → list of HistoryRecord dicts
# Populated by the /predict endpoint after each successful prediction.
_history_store: dict[str, list[dict]] = {}


def save_prediction(user_id: str, record: dict) -> None:
    """Called by the predict route to persist a result."""
    _history_store.setdefault(user_id, []).insert(0, record)


@router.get("/user/{user_id}/history", response_model=UserHistoryResponse)
async def get_history(user_id: str, limit: int = 10):
    records_raw = _history_store.get(user_id, [])[:limit]
    records = [HistoryRecord(**r) for r in records_raw]
    return UserHistoryResponse(
        user_id=user_id,
        total_records=len(_history_store.get(user_id, [])),
        records=records,
    )


@router.get("/user/{user_id}/risk-analysis", response_model=RiskAnalysisResponse)
async def get_risk_analysis(user_id: str, limit: int = 10):
    records = _history_store.get(user_id, [])[:limit]
    if not records:
        return RiskAnalysisResponse(
            user_id=user_id,
            average_risk_score=0.0,
            current_trend="Stable",
            highest_risk_tier="Low",
        )

    scores = [r["risk_score"] for r in records]
    avg = round(sum(scores) / len(scores), 1)

    # Trend: compare first half vs second half of recent history
    mid = max(1, len(scores) // 2)
    recent_avg = sum(scores[:mid]) / mid
    older_avg  = sum(scores[mid:]) / max(1, len(scores) - mid)
    if recent_avg < older_avg - 3:
        trend = "Improving"
    elif recent_avg > older_avg + 3:
        trend = "Worsening"
    else:
        trend = "Stable"

    tier_order = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    highest = max((r["risk_tier"] for r in records), key=lambda t: tier_order.get(t, 0))

    return RiskAnalysisResponse(
        user_id=user_id,
        average_risk_score=avg,
        current_trend=trend,
        highest_risk_tier=highest,
    )
