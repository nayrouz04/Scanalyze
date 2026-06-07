"""
AI helper endpoints.

These endpoints keep browser code away from local model services and API keys.
"""

import json
import logging
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser
from app.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


class AISuggestionRequest(BaseModel):
    field_key: str = Field(min_length=1)
    current_value: str
    doc_type: str = "document"
    all_fields: dict[str, Any] = Field(default_factory=dict)


class AISuggestionResponse(BaseModel):
    value: str
    reason: str


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    clean = text.replace("```json", "").replace("```", "").strip()
    start = clean.find("[")
    end = clean.rfind("]")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON array found in model response")
    data = json.loads(clean[start : end + 1])
    if not isinstance(data, list):
        raise ValueError("Model response is not a JSON array")
    return data


@router.post(
    "/suggestions",
    response_model=list[AISuggestionResponse],
    summary="Generate correction suggestions with the local AI model",
)
async def generate_suggestions(
    payload: AISuggestionRequest,
    current_user: CurrentUser,
):
    context_fields = "\n".join(
        f"{key}: {value}"
        for key, value in payload.all_fields.items()
        if key != payload.field_key
    )

    prompt = f"""Tu es un assistant expert en correction OCR.
Document type: {payload.doc_type}

Champs extraits:
{context_fields}

Champ a corriger: {payload.field_key}
Valeur actuelle: {payload.current_value}

Propose exactement 3 corrections plausibles. Reponds uniquement avec un JSON valide:
[
  {{"value": "correction 1", "reason": "raison courte"}},
  {{"value": "correction 2", "reason": "raison courte"}},
  {{"value": "correction 3", "reason": "raison courte"}}
]"""

    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
            response = await client.post(
                f"{settings.OLLAMA_HOST.rstrip('/')}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
    except httpx.RequestError as e:
        logger.error("Ollama request failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local AI model is not reachable. Start Ollama and pull the configured model.",
        )
    except httpx.HTTPStatusError as e:
        logger.error("Ollama returned an error: %s", e.response.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Local AI model returned an error.",
        )

    model_text = response.json().get("response", "")
    try:
        suggestions = _extract_json_array(model_text)
    except (ValueError, json.JSONDecodeError) as e:
        logger.error("Invalid AI suggestions response: %s | %s", e, model_text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Local AI model returned invalid suggestions.",
        )

    return [
        AISuggestionResponse(
            value=str(item.get("value", "")).strip(),
            reason=str(item.get("reason", "")).strip(),
        )
        for item in suggestions[:3]
        if str(item.get("value", "")).strip()
    ]
