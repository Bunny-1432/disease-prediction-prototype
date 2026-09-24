"""
backend.api.diseases
~~~~~~~~~~~~~~~~~~~~
Real-time Disease Knowledge Base API.
Provides:
  GET  /api/v1/diseases             → List all diseases + 24h sync telemetry
  GET  /api/v1/diseases/{name}      → Full point-to-point profile with live clinical trials & PubMed
  POST /api/v1/diseases/refresh     → Force immediate synchronization with real-time APIs
  GET  /api/v1/diseases/sync-status → Live synchronization status & countdown
"""
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.schemas import (
    DiseaseListResponse,
    DiseaseSummary,
    DiseaseProfile,
    KnowledgeBaseSyncStatus,
)
from backend.services.knowledge_updater import (
    load_cached_knowledge,
    sync_all_diseases,
    get_sync_status,
)

# ── Backwards Compatibility Proxy for Legacy Imports ─────────────────────────
class _DBProxy(dict):
    """Dynamic dict proxy backed by the 24-hour synchronized knowledge cache."""
    def get(self, key, default=None):
        cache = load_cached_knowledge()
        return cache.get("diseases", {}).get(key, default)
    def __getitem__(self, key):
        cache = load_cached_knowledge()
        return cache.get("diseases", {})[key]
    def items(self):
        cache = load_cached_knowledge()
        return cache.get("diseases", {}).items()
    def keys(self):
        cache = load_cached_knowledge()
        return cache.get("diseases", {}).keys()
    def values(self):
        cache = load_cached_knowledge()
        return cache.get("diseases", {}).values()

_DB = _DBProxy()

router = APIRouter()


@router.get("/diseases", response_model=DiseaseListResponse)
async def list_diseases():
    """Return all diseases with summary info and 24-hour sync telemetry."""
    cache = load_cached_knowledge()
    disease_map = cache.get("diseases", {})
    status_info = get_sync_status()

    summaries = [
        DiseaseSummary(
            name=name,
            category=d.get("category", "General"),
            severity=d.get("severity"),
            description=d.get("description", "")[:160] + "..." if len(d.get("description", "")) > 160 else d.get("description", ""),
        )
        for name, d in disease_map.items()
    ]

    return DiseaseListResponse(
        diseases=summaries,
        sync_status=KnowledgeBaseSyncStatus(**status_info),
    )


@router.get("/diseases/sync-status", response_model=KnowledgeBaseSyncStatus)
async def sync_status_endpoint():
    """Return current sync telemetry (last synced, next sync, is_syncing flag)."""
    return KnowledgeBaseSyncStatus(**get_sync_status())


@router.post("/diseases/refresh")
async def force_refresh_diseases(background_tasks: BackgroundTasks):
    """
    Force an immediate synchronization with ClinicalTrials.gov and NCBI PubMed.
    Updates the local 24-hour cache and refreshes clinical evidence.
    """
    loop = asyncio.get_running_loop()
    # Run sync in thread pool so it does not block the async event loop
    updated_cache = await loop.run_in_executor(None, sync_all_diseases, True)
    
    return {
        "status": "success",
        "message": "Disease Knowledge Base successfully refreshed with live real-time clinical trials and PubMed publications.",
        "sync_status": get_sync_status(),
        "total_diseases": len(updated_cache.get("diseases", {})),
    }


@router.get("/diseases/{name:path}", response_model=DiseaseProfile)
async def get_disease(name: str):
    """
    Return the comprehensive, point-to-point profile for a single disease.
    Includes visual biomarker ranges, progression stages, organ impacts,
    actionable protocols, diagnostic tests, and live clinical trials/PubMed papers.
    """
    import urllib.parse
    decoded_name = urllib.parse.unquote(name).strip()

    cache = load_cached_knowledge()
    disease_map = cache.get("diseases", {})
    
    data = disease_map.get(decoded_name)
    if not data:
        # Check case-insensitive match
        for key, val in disease_map.items():
            if key.lower() == decoded_name.lower():
                data = val
                decoded_name = key
                break

    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Disease '{name}' not found in knowledge base. Available: {list(disease_map.keys())}",
        )

    return DiseaseProfile(name=decoded_name, **data)
