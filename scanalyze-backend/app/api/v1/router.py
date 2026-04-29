"""
app/api/v1/router.py – Main router that groups all sub-routers
"""
from fastapi import APIRouter
from app.api.v1 import auth
from app.constants.router_constants import (
    AUTH_PREFIX,
    DOCUMENTS_PREFIX,
    JOBS_PREFIX,
    RESULTS_PREFIX,
)

main_router = APIRouter()

main_router.include_router(auth.router, prefix=AUTH_PREFIX, tags=["auth"])
# main_router.include_router(documents.router, prefix=DOCUMENTS_PREFIX, tags=["documents"])
# main_router.include_router(jobs.router,      prefix=JOBS_PREFIX,      tags=["jobs"])
# main_router.include_router(results.router,   prefix=RESULTS_PREFIX,   tags=["results"])