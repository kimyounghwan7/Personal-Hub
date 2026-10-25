"""add calendar span and soft delete columns to Todos

Revision ID: 8c3e19a4d701
Revises: 2b4f0f7ac9e1
Create Date: 2026-10-25 22:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "8c3e19a4d701"
down_revision: Union[str, Sequence[str], None] = "2b4f0f7ac9e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("Todos", sa.Column("started_on", sa.Date(), nullable=True))
    op.add_column(
        "Todos",
        sa.Column("category", sa.String(length=20), nullable=False, server_default="Work"),
    )
    op.add_column(
        "Todos",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.add_column(
        "Todos",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.add_column("Todos", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("Todos", sa.Column("deleted_by", sa.String(), nullable=True))
    op.add_column("Todos", sa.Column("delete_reason", sa.String(length=200), nullable=True))

    op.create_index(
        "ix_todos_user_due_live",
        "Todos",
        ["user_id", "due_date"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_todos_user_due_live", table_name="Todos")
    op.drop_column("Todos", "delete_reason")
    op.drop_column("Todos", "deleted_by")
    op.drop_column("Todos", "deleted_at")
    op.drop_column("Todos", "updated_at")
    op.drop_column("Todos", "created_at")
    op.drop_column("Todos", "category")
    op.drop_column("Todos", "started_on")
