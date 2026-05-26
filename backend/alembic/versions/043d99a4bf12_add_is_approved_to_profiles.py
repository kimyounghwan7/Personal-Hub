"""add_is_approved_to_profiles

Revision ID: 043d99a4bf12
Revises: 09867aa12d12
Create Date: 2026-04-26 16:56:46.051997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '043d99a4bf12'
down_revision: Union[str, Sequence[str], None] = '09867aa12d12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'Profiles',
        sa.Column('is_approved', sa.Boolean(), nullable=True, server_default=sa.false()),
    )
    op.execute('UPDATE public."Profiles" SET is_approved = FALSE WHERE is_approved IS NULL')
    op.alter_column('Profiles', 'is_approved', nullable=False, server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('Profiles', 'is_approved')
