"""add interview completion status

Revision ID: 994fe48a4447
Revises: 7218b67325b4
Create Date: 2026-08-08

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "994fe48a4447"
down_revision: Union[str, Sequence[str], None] = "7218b67325b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add the column with a temporary server-side default.
    # Existing interviews will automatically become incomplete.
    op.add_column(
        "interviews",
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # Remove the database-level default.
    # New rows will get the default from the SQLAlchemy model.
    op.alter_column(
        "interviews",
        "completed",
        server_default=None,
    )

    # Add completion timestamp.
    op.add_column(
        "interviews",
        sa.Column(
            "completed_at",
            sa.DateTime(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "interviews",
        "completed_at",
    )

    op.drop_column(
        "interviews",
        "completed",
    )