"""add doc_type_id to documents

Revision ID: f4b2c1d8a9e0
Revises: 9374c6244560
Create Date: 2026-05-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f4b2c1d8a9e0"
down_revision: Union[str, Sequence[str], None] = "9374c6244560"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OTHERS_ID = "00000000-0000-0000-0000-000000000001"
OTHERS_NAME = "autres"

def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "doc_types",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.execute(
        f"""
        INSERT INTO doc_types (id, name)
        VALUES ('{OTHERS_ID}', '{OTHERS_NAME}')
        """
    )
    op.execute(
        """
        INSERT INTO doc_types (id, name)
        SELECT gen_random_uuid(), lower(trim(doc_type))
        FROM documents
        WHERE doc_type IS NOT NULL 
        AND trim(doc_type) <> ''
        AND lower(trim(doc_type)) <> 'autres'  
        GROUP BY lower(trim(doc_type))
        ON CONFLICT (name) DO NOTHING
        """
    )
    
    op.add_column("documents", sa.Column("doc_type_id", sa.UUID(), nullable=True))

    op.execute(
        """
        UPDATE documents
        SET doc_type_id = doc_types.id
        FROM doc_types
        WHERE lower(trim(documents.doc_type)) = doc_types.name
        """
    )
    
    op.execute(
        f"""
        UPDATE documents
        SET doc_type_id = '{OTHERS_ID}'
        WHERE doc_type_id IS NULL
        """
    )

    op.create_foreign_key(
        "fk_documents_doc_type_id_doc_types",
        "documents",
        "doc_types",
        ["doc_type_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_column("documents", "doc_type")

def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "documents",
        sa.Column("doc_type", sa.String(length=100), nullable=True)
    )
    
    op.execute(
        """
        UPDATE documents
        SET doc_type = doc_types.name
        FROM doc_types
        WHERE documents.doc_type_id = doc_types.id
        """
    )
    op.drop_constraint("fk_documents_doc_type_id_doc_types", "documents", type_="foreignkey")
    op.drop_column("documents", "doc_type_id")
    op.drop_table("doc_types")
