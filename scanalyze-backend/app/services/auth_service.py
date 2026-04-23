"""
app/services/auth_service.py – Auth business logic (no HTTP concerns here)
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import RegisterRequest

settings = get_settings()
logger = logging.getLogger(__name__)

# Lock account after this many failed attempts
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


class AuthError(Exception):
    """Domain-level auth error — converted to HTTP response in the router."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthService:

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Register ──────────────────────────────────────────────────────────────

    async def register(self, data: RegisterRequest) -> User:
        # Check email uniqueness
        existing = await self.db.execute(
            select(User).where(User.email == data.email.lower())
        )
        if existing.scalar_one_or_none():
            raise AuthError("Email already registered", 409)

        # Check username uniqueness
        existing_username = await self.db.execute(
            select(User).where(User.username == data.username.lower())
        )
        if existing_username.scalar_one_or_none():
            raise AuthError("Username already taken", 409)

        user = User(
            id=uuid.uuid4(),
            email=data.email.lower(),
            username=data.username.lower(),
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role="user",
            is_active=True,
            is_verified=False,   # set True after email verification flow
        )
        self.db.add(user)
        await self.db.flush()   # get the ID without committing

        logger.info("New user registered: %s", user.email)
        return user

    # ── Login ─────────────────────────────────────────────────────────────────

    async def login(
        self,
        login: str,
        password: str,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> tuple[str, str, datetime]:
        """
        Returns (access_token, refresh_token, access_token_expires_at).
        Raises AuthError on failure.
        """
        user = await self._get_user_by_login(login)

        if user is None:
            # Constant-time fake verify to prevent user enumeration via timing
            hash_password("fake-constant-time-check")
            raise AuthError("Invalid credentials", 401)

        if not user.is_active:
            raise AuthError("Account is disabled", 403)

        if user.is_locked:
            raise AuthError(
                f"Account locked. Try again after {user.locked_until.strftime('%H:%M UTC')}",
                403,
            )

        if not verify_password(password, user.hashed_password):
            await self._record_failed_attempt(user)
            raise AuthError("Invalid credentials", 401)

        # Successful login — reset failure counter
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)

        access_token, expires_at = create_access_token(
            subject=str(user.id),
            role=user.role,
        )
        refresh_token = await self._create_refresh_token(
            user=user,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        await self.db.flush()
        return access_token, refresh_token, expires_at

    # ── Refresh ───────────────────────────────────────────────────────────────

    async def refresh(self, raw_token: str) -> tuple[str, datetime]:
        """
        Validate a refresh token and issue a new access token.
        Returns (new_access_token, expires_at).
        """
        token_hash = hash_token(raw_token)

        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        stored = result.scalar_one_or_none()

        if stored is None or stored.is_revoked:
            raise AuthError("Invalid or revoked refresh token", 401)

        if stored.expires_at < datetime.now(timezone.utc):
            raise AuthError("Refresh token expired", 401)

        # Load the user
        user_result = await self.db.execute(
            select(User).where(User.id == stored.user_id)
        )
        user = user_result.scalar_one_or_none()

        if user is None or not user.is_active:
            raise AuthError("User not found or disabled", 401)

        if user.is_locked:
            raise AuthError("Account is locked", 403)

        access_token, expires_at = create_access_token(
            subject=str(user.id),
            role=user.role,
        )
        await self.db.flush()
        return access_token, expires_at

    # ── Logout ────────────────────────────────────────────────────────────────

    async def logout(self, raw_token: str) -> None:
        """Revoke a single refresh token."""
        token_hash = hash_token(raw_token)

        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        stored = result.scalar_one_or_none()

        if stored and not stored.is_revoked:
            stored.is_revoked = True
            await self.db.flush()

    async def logout_all(self, user_id: uuid.UUID) -> None:
        """Revoke ALL refresh tokens for a user (sign out all devices)."""
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_revoked == False,  # noqa: E712
            )
        )
        for token in result.scalars().all():
            token.is_revoked = True
        await self.db.flush()

    # ── Change password ───────────────────────────────────────────────────────

    async def change_password(
        self, user: User, current_password: str, new_password: str
    ) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise AuthError("Current password is incorrect", 400)

        user.hashed_password = hash_password(new_password)

        # Revoke all refresh tokens — force re-login on all devices
        await self.logout_all(user.id)
        await self.db.flush()

    # ── Private helpers ───────────────────────────────────────────────────────

    async def _get_user_by_login(self, login: str) -> User | None:
        """Find user by email OR username."""
        login = login.lower().strip()
        result = await self.db.execute(
            select(User).where(
                (User.email == login) | (User.username == login)
            )
        )
        return result.scalar_one_or_none()

    async def _record_failed_attempt(self, user: User) -> None:
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=LOCKOUT_MINUTES
            )
            logger.warning(
                "Account locked after %d failed attempts: %s",
                MAX_FAILED_ATTEMPTS,
                user.email,
            )
        await self.db.flush()

    async def _create_refresh_token(
        self,
        user: User,
        user_agent: str | None,
        ip_address: str | None,
    ) -> str:
        raw_token = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        stored = RefreshToken(
            id=uuid.uuid4(),
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        self.db.add(stored)
        return raw_token