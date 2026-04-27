"""
app/api/v1/auth.py – Auth endpoints

POST /auth/register       Create account
POST /auth/token          Login → access + refresh token
POST /auth/refresh        Rotate access token using refresh token
POST /auth/logout         Revoke refresh token
POST /auth/logout-all     Revoke all refresh tokens (all devices)
POST /auth/change-password Change password (authenticated)
GET  /auth/me             Get current user profile
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserInfo,
)
from app.services.auth_service import AuthError, AuthService

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_client_info(request: Request) -> tuple[str | None, str | None]:
    """Extract User-Agent and real IP (handles reverse proxy headers)."""
    user_agent = request.headers.get("user-agent")
    ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip")
        or (request.client.host if request.client else None)
    )
    return user_agent, ip


def _auth_error_to_http(e: AuthError) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


# ── Register ──────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
async def register(
    data: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Register a new user. Returns the created user profile.
    Password rules: 8+ chars, uppercase, lowercase, digit, special char.
    """
    try:
        service = AuthService(db)
        user = await service.register(data)
        return RegisterResponse.model_validate(user)
    except AuthError as e:
        raise _auth_error_to_http(e)


# ── Login / Token ─────────────────────────────────────────────────────────────

@router.post(
    "/token",
    response_model=TokenResponse,
    summary="Login — returns access + refresh token",
)
async def login(
    data: LoginRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Authenticate with email/username + password.
    Returns a short-lived access token (JWT) and a long-lived refresh token.

    - Access token: put in `Authorization: Bearer <token>` header.
    - Refresh token: store securely (httpOnly cookie recommended for web apps).
    - After `MAX_FAILED_ATTEMPTS` (5) wrong passwords the account is locked for 15 min.
    """
    user_agent, ip = _get_client_info(request)

    try:
        service = AuthService(db)
        access_token, refresh_token, expires_at = await service.login(
            login=data.login,
            password=data.password,
            user_agent=user_agent,
            ip_address=ip,
        )
    except AuthError as e:
        raise _auth_error_to_http(e)

    # We need the user object for the response — re-fetch via service
    from app.core.security import decode_access_token
    from app.models.user import User
    from sqlalchemy import select
    import uuid

    payload = decode_access_token(access_token)
    result = await db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
    user = result.scalar_one()

    from app.config import get_settings
    settings = get_settings()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserInfo.model_validate(user),
    )


# ── Refresh ───────────────────────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Get a new access token using a refresh token",
)
async def refresh(
    data: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Exchange a valid (non-expired, non-revoked) refresh token for a new access token.
    The refresh token itself is NOT rotated here — use /logout + /token to rotate it.
    """
    try:
        service = AuthService(db)
        access_token, expires_at = await service.refresh(data.refresh_token)
    except AuthError as e:
        raise _auth_error_to_http(e)

    from app.config import get_settings
    settings = get_settings()

    return RefreshResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Revoke a refresh token (logout current device)",
)
async def logout(
    data: LogoutRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Revoke the provided refresh token. Idempotent — safe to call multiple times."""
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    summary="Revoke all refresh tokens (logout all devices)",
)
async def logout_all(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Requires a valid access token. Revokes ALL refresh tokens for this account."""
    service = AuthService(db)
    await service.logout_all(current_user.id)
    return MessageResponse(message="Logged out from all devices")


# ── Change password ───────────────────────────────────────────────────────────

@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password (invalidates all sessions)",
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Change password. Requires current password verification.
    All refresh tokens are revoked — user must re-login on all devices.
    """
    try:
        service = AuthService(db)
        await service.change_password(
            user=current_user,
            current_password=data.current_password,
            new_password=data.new_password,
        )
    except AuthError as e:
        raise _auth_error_to_http(e)

    return MessageResponse(message="Password changed. Please log in again.")


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserInfo,
    summary="Get current user profile",
)
async def me(current_user: CurrentUser):
    """Returns the profile of the currently authenticated user."""
    return UserInfo.model_validate(current_user)