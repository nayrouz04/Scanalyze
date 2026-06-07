"""Structured extraction stage.

This stage turns OCR text and layout hints into document-specific field
structures.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ExtractedFieldPayload:
    field_name: str
    field_label: str | None
    field_category: str | None
    raw_value: Any
    normalized_value: Any
    data_type: str
    confidence: float
    page_number: int | None = None
    bbox_x: float | None = None
    bbox_y: float | None = None
    bbox_w: float | None = None
    bbox_h: float | None = None


class StructuredExtractionStage(PipelineStage):
    """Create field payloads from OCR/classification results."""

    def __init__(self) -> None:
        logger.info("[Pipeline] StructuredExtractionStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            doc_type = str(input_data.get("doc_type") or "unknown").lower()
            text = str(
                input_data.get("reconstructed_text")
                or input_data.get("normalized_text")
                or input_data.get("text")
                or ""
            ).strip()
            lines = input_data.get("lines") or []
            tables = input_data.get("tables") or []
            layout = input_data.get("layout") or {}
            fields = self._extract_fields(doc_type, text, lines, tables,layout, input_data)
            return StageResult(
                stage_name="structured_extraction",
                success=True,
                data={
                    **input_data,
                    "fields": [
                        {
                            "field_name": field.field_name,
                            "field_label": field.field_label,
                            "field_category": field.field_category,
                            "raw_value": field.raw_value,
                            "normalized_value": field.normalized_value,
                            "data_type": field.data_type,
                            "confidence": field.confidence,
                            "page_number": field.page_number,
                            "bbox_x": field.bbox_x,
                            "bbox_y": field.bbox_y,
                            "bbox_w": field.bbox_w,
                            "bbox_h": field.bbox_h,
                        }
                        for field in fields
                    ],
                },
                metadata={
                    "field_count": len(fields),
                    "doc_type": doc_type,
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] StructuredExtractionStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="structured_extraction",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _extract_fields(
        self,
        doc_type: str,
        text: str,
        lines: Any,
        tables: Any,
        layout: Any,
        input_data: Dict[str, Any],
    ) -> List[ExtractedFieldPayload]:
        if doc_type == "invoice":
            return self._extract_invoice(text, lines, tables, layout)
        if doc_type == "cv":
            return self._extract_cv(text, lines, layout)
        if doc_type in {"legal", "contract"}:
            return self._extract_legal(text, lines, layout)
        return self._extract_generic(text, lines, layout)

    def _extract_cv(self, text: str, lines: Any, layout: Any) -> List[ExtractedFieldPayload]:
        email = self._first_match(text, r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
        phone = self._first_match(text, r"\+?[0-9][0-9\s\-]{7,}")
        name = self._guess_name(lines)
        headline = self._guess_headline(lines)
        skills = self._collect_skills(text, lines)
        experience = self._collect_section(lines, ("experience", "expérience", "work experience", "professional experience"))
        education = self._collect_section(lines, ("education", "formation", "studies", "academic"))
        location = self._guess_location(lines)
        summary = self._guess_summary(lines)
        return [
            self._field("personal_info.headline", "Headline", "personal_info", headline, "string", 0.70),
            self._field("personal_info.contact.email", "Email", "personal_info", email, "string", 0.92),
            self._field("personal_info.contact.phone", "Phone", "personal_info", phone, "string", 0.88),
            self._field("personal_info.contact.location", "Location", "personal_info", location, "string", 0.72),
            self._field("summary", "Summary", "profile", summary, "string", 0.60),
            self._field("skills", "Skills", "profile", skills, "array", 0.75),
            self._field("experience", "Experience", "profile", experience, "array", 0.78),
            self._field("education", "Education", "profile", education, "array", 0.78),
        ]

    def _extract_invoice(self, text: str, lines: Any, tables: Any, layout: Any) -> List[ExtractedFieldPayload]:
        invoice_number = self._first_match(text, r"(invoice\s*(no|number)?\s*[:#]?\s*[A-Z0-9\-\/]+)")
        invoice_date = self._first_match(text, r"(\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b)")
        due_date = self._first_match(text, r"(due\s*date\s*[:\-]?\s*[A-Za-z0-9/.\-]+)")
        seller = self._guess_party(lines, ("seller", "supplier", "vendor", "from"))
        buyer = self._guess_party(lines, ("buyer", "customer", "client", "bill to", "billed to"))
        subtotal = self._first_match(text, r"(subtotal\s*[:\-]?\s*[0-9][0-9., ]+)")
        tax = self._first_match(text, r"(vat|tax)\s*[:\-]?\s*[0-9][0-9., ]+")
        total = self._first_match(text, r"(grand\s*total|total\s*due|total\s*[:\-]?\s*[0-9][0-9., ]+)")
        currency = self._guess_currency(text)
        items = self._collect_invoice_items(tables, lines)
        return [
             self._field("invoice.invoice_number", "Invoice Number", "invoice", invoice_number, "string", 0.86),
            self._field("invoice.issue_date", "Issue Date", "invoice", invoice_date, "string", 0.82),
            self._field("invoice.due_date", "Due Date", "invoice", due_date, "string", 0.78),
            self._field("invoice.seller", "Seller", "invoice", seller, "object", 0.70),
            self._field("invoice.buyer", "Buyer", "invoice", buyer, "object", 0.70),
            self._field("invoice.subtotal", "Subtotal", "invoice", subtotal, "string", 0.82),
            self._field("invoice.tax", "Tax", "invoice", tax, "string", 0.80),
            self._field("invoice.total", "Total", "invoice", total, "string", 0.84),
            self._field("invoice.currency", "Currency", "invoice", currency, "string", 0.70),
            self._field("invoice.line_items", "Line Items", "invoice", items, "array", 0.74),
        ]

    def _extract_legal(self, text: str, lines: Any, layout: Any) -> List[ExtractedFieldPayload]:
        title = lines[0] if isinstance(lines, list) and lines else None
        parties = self._guess_legal_parties(lines)
        effective_date = self._first_match(text, r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b")
        clauses = self._collect_section(lines, ("clause", "article", "section", "stipulation"))
        return [
            self._field("legal.title", "Title", "legal", title, "string", 0.75),
            self._field("legal.reference", "Reference", "legal", self._first_match(text, r"(ref(erence)?\s*[:#]?\s*[A-Z0-9\-\/]+)"), "string", 0.72),
            self._field("legal.parties", "Parties", "legal", parties, "array", 0.72),
            self._field("legal.effective_date", "Effective Date", "legal", effective_date, "string", 0.72),
            self._field("legal.clauses", "Clauses", "legal", clauses, "array", 0.74),
        ]

    def _extract_generic(self, text: str, lines: Any, layout: Any) -> List[ExtractedFieldPayload]:
        first_line = lines[0] if isinstance(lines, list) and lines else (text[:120] if text else None)
        key_values = self._collect_key_values(lines)
        return [
            self._field("document.title", "Title", "generic", first_line, "string", 0.60),
            self._field("document.key_values", "Key Values", "generic", key_values, "object", 0.55),
        ]

    def _field(
        self,
        field_name: str,
        field_label: str | None,
        field_category: str | None,
        value: Any,
        data_type: str,
        confidence: float,
    ) -> ExtractedFieldPayload:
        return ExtractedFieldPayload(
            field_name=field_name,
            field_label=field_label,
            field_category=field_category,
            raw_value=value,
            normalized_value=value,
            data_type=data_type,
            confidence=confidence,
        )

    def _first_match(self, text: str, pattern: str) -> str | None:
        

        match = re.search(pattern, text, flags=re.IGNORECASE)
        return match.group(0).strip() if match else None

    def _guess_name(self, lines: Any) -> str | None:
        if not isinstance(lines, list):
            return None
        for line in lines[:5]:
            candidate = str(line).strip()
            if candidate and len(candidate.split()) in {2, 3, 4} and not any(ch.isdigit() for ch in candidate):
                return candidate
        return None
    def _guess_headline(self, lines: Any) -> str | None:
        if not isinstance(lines, list):
            return None
        for line in lines[1:6]:
            candidate = str(line).strip()
            if candidate and len(candidate.split()) >= 2 and len(candidate) < 90 and not any(ch.isdigit() for ch in candidate):
                return candidate
        return None

    def _guess_location(self, lines: Any) -> str | None:
        if not isinstance(lines, list):
            return None
        for line in lines[:10]:
            candidate = str(line).strip()
            if "," in candidate and len(candidate) <= 120:
                return candidate
        return None

    def _guess_summary(self, lines: Any) -> str | None:
        if not isinstance(lines, list):
            return None
        for line in lines[:15]:
            candidate = str(line).strip()
            if len(candidate.split()) >= 8 and len(candidate) <= 250:
                return candidate
        return None

    def _collect_skills(self, text: str, lines: Any) -> list[str]:
        source = " ".join([text] + [str(line) for line in lines if isinstance(line, (str, int, float))])
        candidates = set()
        for term in [
            "python", "java", "javascript", "typescript", "sql", "excel", "power bi",
            "machine learning", "deep learning", "project management", "communication",
            "docker", "kubernetes", "linux", "react", "node", "pandas", "numpy",
        ]:
            if term in source.lower():
                candidates.add(term)
        return sorted(candidates)

    def _collect_section(self, lines: Any, keywords: tuple[str, ...]) -> list[str]:
        if not isinstance(lines, list):
            return []
        collected: list[str] = []
        capture = False
        for raw in lines:
            line = str(raw).strip()
            lower = line.lower()
            if any(keyword in lower for keyword in keywords):
                capture = True
                continue
            if capture:
                if len(line) < 3:
                    break
                if self._looks_like_heading(line):
                    break
                collected.append(line)
        return collected[:12]

    def _looks_like_heading(self, line: str) -> bool:
        return len(line) <= 80 and (line.isupper() or line.endswith(":"))

    def _guess_party(self, lines: Any, keywords: tuple[str, ...]) -> dict[str, Any] | None:
        if not isinstance(lines, list):
            return None
        lowered = [str(line).lower() for line in lines]
        for idx, line in enumerate(lowered):
            if any(keyword in line for keyword in keywords):
                values = []
                for candidate in lines[idx + 1 : idx + 4]:
                    text = str(candidate).strip()
                    if text:
                        values.append(text)
                return {"label": lines[idx], "values": values}
        return None

    def _guess_legal_parties(self, lines: Any) -> list[str]:
        if not isinstance(lines, list):
            return []
        parties = []
        for line in lines:
            lower = str(line).lower()
            if "party" in lower or "between" in lower or "and" in lower:
                parties.append(str(line).strip())
        return parties[:10]

    def _guess_currency(self, text: str) -> str | None:
        upper = text.upper()
        for currency in ("EUR", "USD", "MAD", "TND", "GBP", "$", "€"):
            if currency in upper:
                return currency
        return None

    def _collect_invoice_items(self, tables: Any, lines: Any) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        if isinstance(tables, list):
            for table in tables:
                if not isinstance(table, dict):
                    continue
                items.append(
                    {
                        "bbox": table.get("bbox"),
                        "rows": table.get("rows"),
                        "columns": table.get("columns"),
                    }
                )
        if not items and isinstance(lines, list):
            for line in lines[:10]:
                text = str(line).strip()
                if any(char.isdigit() for char in text) and len(text.split()) >= 2:
                    items.append({"raw": text})
        return items[:20]

    def _collect_key_values(self, lines: Any) -> dict[str, str]:
        if not isinstance(lines, list):
            return {}
        data: dict[str, str] = {}
        for raw in lines:
            line = str(raw)
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            key = re.sub(r"[^a-z0-9]+", "_", key.lower()).strip("_")
            value = value.strip()
            if key and value:
                data[key] = value
        return data