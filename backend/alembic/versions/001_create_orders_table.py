"""create orders table

Revision ID: 001
Revises: 
Create Date: 2026-03-08 05:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('nama', sa.String(255), nullable=False, index=True),
        sa.Column('no_hp', sa.String(50), nullable=False),
        sa.Column('alamat', sa.Text(), nullable=False),
        sa.Column('size_anak_pendek', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('size_anak_panjang', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('size_dewasa_pendek', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('size_dewasa_panjang', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('total_harga', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False, index=True),
    )


def downgrade() -> None:
    # Drop orders table
    op.drop_table('orders')