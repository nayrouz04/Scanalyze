"""
app/api/v1/router.py – Main router that groups all sub-routers
"""
from fastapi import APIRouter
from app.api.v1 import auth, admin, ai, documents, doc_types, jobs, results, ws

from app.constants.router_constants import (
    AUTH_PREFIX,
    ADMIN_PREFIX,
    DOCUMENTS_PREFIX,
    DOC_TYPES_PREFIX,
    JOBS_PREFIX,
    RESULTS_PREFIX,
    WS_PREFIX,
)

main_router = APIRouter()

main_router.include_router(auth.router, prefix=AUTH_PREFIX, tags=["auth"])
main_router.include_router(admin.router, prefix=ADMIN_PREFIX, tags=["admin"])

main_router.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
main_router.include_router(documents.router, prefix=DOCUMENTS_PREFIX, tags=["documents"])
main_router.include_router(doc_types.router, prefix=DOC_TYPES_PREFIX, tags=["doc-types"])
main_router.include_router(jobs.router, prefix=JOBS_PREFIX, tags=["jobs"])
main_router.include_router(results.router, prefix=RESULTS_PREFIX, tags=["results"])
main_router.include_router(ws.router, prefix=WS_PREFIX, tags=["websocket"])
