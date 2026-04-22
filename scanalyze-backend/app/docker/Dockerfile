# ─────────────────────────────────────────────
#  Stage 1 – Python dependency builder
# ─────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# System deps needed to compile some ML packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      g++ \
      libglib2.0-0 \
      libsm6 \
      libxext6 \
      libxrender-dev \
      libgomp1 \
      libglx0 \
      curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy requirements first — Docker layer cache:
# if requirements.txt doesn't change, this layer is reused.
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm


# ─────────────────────────────────────────────
#  Stage 2 – Runtime image
# ─────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Runtime system libs only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libglib2.0-0 \
      libsm6 \
      libxext6 \
      libxrender1 \
      libgomp1 \
      libglx0 \
      curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy installed packages from builder
COPY --from=builder /install /usr/local
# Copy spaCy model
COPY --from=builder /usr/local/lib/python3.11/site-packages/en_core_web_sm \
     /usr/local/lib/python3.11/site-packages/en_core_web_sm

# Copy application source
COPY --chown=appuser:appuser . .

# Create directories the app will write to
RUN mkdir -p /app/logs /app/tmp && chown -R appuser:appuser /app/logs /app/tmp

USER appuser

EXPOSE 8000

# Health-check used by Docker and compose depends_on
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Overridden per-environment in compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]