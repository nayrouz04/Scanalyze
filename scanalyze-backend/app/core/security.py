"""
app/core/security.py – Password hashing, JWT creation and verification
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

# ── Password hashing ──────────────────────────────────────────────────────────
# bcrypt with 12 rounds — good balance of security vs speed
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Token hashing (for DB storage of refresh tokens) ─────────────────────────

def hash_token(token: str) -> str:
    """SHA-256 hash of a token — safe to store in DB."""
    return hashlib.sha256(token.encode()).hexdigest()


def generate_refresh_token() -> str:
    """Cryptographically secure 64-byte random token."""
    return secrets.token_urlsafe(64)


# ── JWT ───────────────────────────────────────────────────────────────────────

ALGORITHM = "HS256"


def create_access_token(
    subject: str,
    role: str,
    extra: dict[str, Any] | None = None,
) -> tuple[str, datetime]:
    """
    Returns (encoded_jwt, expires_at).
    subject = user UUID as string.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": "access",
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }
    if extra:
        payload.update(extra)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM), expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate an access token.
    Raises JWTError on any failure (expired, invalid sig, wrong type).
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("type") != "access":
        raise JWTError("Invalid token type")

    return payload