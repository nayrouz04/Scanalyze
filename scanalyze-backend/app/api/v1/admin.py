"""
app/api/v1/admin.py – Admin endpoints
Only users with role "admin" can access these endpoints

GET  /admin/users/pending      → list users waiting for approval
POST /admin/users/{id}/enable  → approve a user account
POST /admin/users/{id}/disable → disable a user account
"""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.auth import MessageResponse
from app.services.admin_service import AdminError, AdminService

router = APIRouter()
logger = logging.getLogger(__name__)

def _admin_error_to_http(e: AdminError) -> HTTPException:
    """Convert AdminError to HTTPException — same pattern as auth.py."""
    return HTTPException(status_code=e.status_code, detail=e.message)
def _require_admin(current_user: CurrentUser) -> None:
    """Check that the current has admin role"""
    if current_user.role != "admin":
        raise AdminError("Admin access required", 403)
    
#______ list pending users _____________
@router.get(
    "/users/pending",
    summary="List users waiting for admin approval",
)
async def list_pending_users(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns all users with account_enabled = False"""
    try:
        _require_admin(current_user)
        service = AdminService(db)
        users = await service.get_pending_users()
    except AdminError as e:
        raise _admin_error_to_http(e)

    return [
        {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at,
            "office_address": user.office_address,
            "phone_nbr": user.phone_nbr,
        }
        for user in users
    ]
#__________ Enable user _____________
@router.post(
    "/users/{user_id}/enable",
    response_model=MessageResponse,
    summary="Approve a user account",
)
async def enable_user(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Set account_enabled = True and notify the user by email"""
    try:
        _require_admin(current_user)
        service = AdminService(db)
        user = await service.enable_user(user_id)
    except AdminError as e:
        raise _admin_error_to_http(e)

    return MessageResponse(message=f"Account {user.email} has been approved successfully")
#______ Disable user _______________
@router.post(
    "/users/{user_id}/disable",
    response_model=MessageResponse,
    summary="Disable a user account",
)
async def disable_user(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Set account_enabled = False and notify the user by email."""
    try:
        _require_admin(current_user)
        service = AdminService(db)
        user = await service.disable_user(user_id)
    except AdminError as e:
        raise _admin_error_to_http(e)

    return MessageResponse(message=f"Account {user.email} has been disabled successfully") 
    
    