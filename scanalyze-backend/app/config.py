"""
app/config.py – Pydantic-settings config loaded per APP_ENV
"""
import os
from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# ═══════════════════════════════════════════════════════════════════════════
# OCR PIPELINE CONFIGURATION CLASSES
# ═══════════════════════════════════════════════════════════════════════════

class OCRPreprocessingConfig(BaseModel):
    """Configuration for the preprocessing stage."""
    enabled: bool = True
    min_width: int = 1200
    max_width: int = 2200
    clahe_clip_limit: float = 2.0
    clahe_tile_grid_size: tuple[int, int] = (8, 8)
    adaptive_block_size: int = 31
    adaptive_c: int = 11
    denoise_blur_threshold: float = 80.0
    noise_threshold: float = 9.0
    contrast_threshold: float = 45.0
    dark_threshold: float = 80.0
    bright_threshold: float = 210.0
    deskew_enabled: bool = True
    perspective_correction_enabled: bool = True
    shadow_correction_enabled: bool = True
    orientation_candidates_enabled: bool = True
    multi_pass_enabled: bool = True
    border_cleanup_margin: int = 6
    max_candidates: int = 6


class Settings(BaseSettings):
    # ── Core ──────────────────────────────────
    APP_ENV: Literal["dev", "staging", "prod", "test"] = "dev"
    DEBUG: bool = False
    LOG_LEVEL: str = "info"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:5174"]

    # ── Database ──────────────────────────────
    DATABASE_URL: str
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    # ── Redis / Celery ────────────────────────
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # ── Ollama ────────────────────────────────
    OLLAMA_HOST: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "qwen2.5:0.5b"
    OLLAMA_TIMEOUT: int = 120

    # ── Object Storage ────────────────────────
    S3_ENDPOINT_URL: str | None = None   # None = real AWS
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET_UPLOADS: str = "vision-uploads"
    S3_BUCKET_RESULTS: str = "vision-results"
    S3_REGION: str = "us-east-1"

    # ── Email ─────────────────────────────────
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@example.com"
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Monitoring ────────────────────────────
    SENTRY_DSN: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 0.0

    # ── Rate limiting ─────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def is_dev(self) -> bool:
        return self.APP_ENV == "dev"

    @property
    def is_prod(self) -> bool:
        return self.APP_ENV == "prod"

    model_config = SettingsConfigDict(
        # Load from .env.{APP_ENV} file
        env_file=f".env.{os.getenv('APP_ENV', 'dev')}",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — called via FastAPI Depends."""
    return Settings()