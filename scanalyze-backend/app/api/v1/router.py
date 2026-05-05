"""
app/api/v1/router.py – Main router that groups all sub-routers
"""
from fastapi import APIRouter
from app.api.v1 import auth, admin, documents
from app.constants.router_constants import (
    AUTH_PREFIX,
    ADMIN_PREFIX,
    DOCUMENTS_PREFIX
)

main_router = APIRouter()

main_router.include_router(auth.router, prefix=AUTH_PREFIX, tags=["auth"])
main_router.include_router(admin.router, prefix=ADMIN_PREFIX, tags=["admin"])
main_router.include_router(documents.router, prefix=DOCUMENTS_PREFIX, tags=["documents"])