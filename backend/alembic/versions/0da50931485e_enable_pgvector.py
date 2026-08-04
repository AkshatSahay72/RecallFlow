"""enable_pgvector

Revision ID: 0da50931485e
Revises: 00d9949ca546
Create Date: 2026-08-04 11:41:53.281889

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0da50931485e'
down_revision: Union[str, Sequence[str], None] = '00d9949ca546'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable the pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    
def downgrade() -> None:
    # Disable the pgvector extension (optional/safety fallback)
    op.execute("DROP EXTENSION IF EXISTS vector")
