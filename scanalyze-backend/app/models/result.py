""" 
app/models/result.py - ExtractedField + Result ORM models

ExtractedField → stores each field extracted by the AI pipeline
Result         → stores the final assembled JSON ready for export
"""

from __future__ import annotations
from typing import TYPE_CHECKING
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.job import ExtractionJob
    from app.models.user import User
#________ ExtractedField ____________________
class ExtractedField(Base):
    __tablename__ = "extracted_fields"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    #_____ Links to other tables _________
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
        # which document contains this field
    )
    
    #which job extracted this field
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("extraction_jobs.id", ondelete="SET NULL"), nullable=False
    )

    field_name: Mapped[str] = mapped_column(String(200), nullable=False)
    # technical field name: 'total_amount', 'supplier_name', 'date', ...

    field_label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # user-friendly field name: 'Total Amount', 'Supplier Name', 'Date', ...
    # can be None if not yet defined
    
    field_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # category of the field: 'amount', 'date', ...
    
    raw_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    # if ocr_value != raw_value → frontend displays "CORRECTION NEEDED" 
    normalized_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    #corrected/formatted value after user validation or auto-normalization 
    data_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # field coordinates in the document (bounding box)
    # used to highlight the field in the interface
    bbox_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_w: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_h: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_validated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_skipped: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    validated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    ) #when the field was extracted by the AI pipeline
    
    #___________ Relationships ___________
    document: Mapped["Document"] = relationship("Document", back_populates="extracted_fields")
    job: Mapped["ExtractionJob | None"] = relationship("ExtractionJob", back_populates="extracted_fields")
    validator: Mapped["User | None"] = relationship("User", foreign_keys=[validated_by])
    
    def __repr__(self) -> str:
        return f"<ExtractedField field_name={self.field_name} confidence={self.confidence}>"

#________ Result ____________________
class Result(Base):
    __tablename__ = "results"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("extraction_jobs.id"), nullable=False
    )
   
    exported_data: Mapped[str] = mapped_column(Text, nullable=False) 
    exported_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False  
    )
    exported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    #_______ Realtionships _________
    document: Mapped["Document"] = relationship("Document", back_populates="results")
    job: Mapped["ExtractionJob | None"] = relationship("ExtractionJob", back_populates="result")
    user: Mapped["User"] = relationship("User", foreign_keys=[exported_by]) 
    
    def __repr__(self) -> str:
        return f"<Result id={self.id} document_id={self.document_id}>"
    
   