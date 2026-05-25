"""
app/models/doc_type.py - DocumentType ORM model
Stores document types created by the admin
"""
from __future__ import annotations
from typing import TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
if TYPE_CHECKING:
    from app.models.document import Document

class DocumentType(Base):
    __tablename__ = "doc_types"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    name: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )# unique = True for ensuring no duplicate document types

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="document_type")
    
    def __repr__(self) -> str:
        return f"<DocumentType id={self.id}, name={self.name}>"




