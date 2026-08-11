"""add email verification and password reset otp

Revision ID: c0bb032f6fa3
Revises: 994fe48a4447
Create Date: 2026-08-11 20:47:14.229439
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "c0bb032f6fa3"
down_revision: Union[str, Sequence[str], None] = "994fe48a4447"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ============================================================
# UPGRADE
# ============================================================

def upgrade() -> None:
    """Upgrade schema."""

    # --------------------------------------------------------
    # EMAIL VERIFICATION
    # --------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "verification_otp",
            sa.String(length=6),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "verification_otp_expires",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # PASSWORD RESET OTP
    # --------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "reset_otp",
            sa.String(length=6),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "reset_otp_expires",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # REMOVE OLD RESET TOKEN
    # --------------------------------------------------------

    op.drop_constraint(
        op.f("users_reset_token_key"),
        "users",
        type_="unique",
    )

    op.drop_column(
        "users",
        "reset_token_expires",
    )

    op.drop_column(
        "users",
        "reset_token",
    )

    # --------------------------------------------------------
    # REMOVE TEMPORARY DATABASE DEFAULT
    # --------------------------------------------------------

    op.alter_column(
        "users",
        "email_verified",
        server_default=None,
    )


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:
    """Downgrade schema."""

    # --------------------------------------------------------
    # RESTORE OLD RESET TOKEN COLUMNS
    # --------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "reset_token",
            sa.VARCHAR(length=255),
            autoincrement=False,
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "reset_token_expires",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
    )

    op.create_unique_constraint(
        op.f("users_reset_token_key"),
        "users",
        ["reset_token"],
        postgresql_nulls_not_distinct=False,
    )

    # --------------------------------------------------------
    # REMOVE OTP COLUMNS
    # --------------------------------------------------------

    op.drop_column(
        "users",
        "reset_otp_expires",
    )

    op.drop_column(
        "users",
        "reset_otp",
    )

    op.drop_column(
        "users",
        "verification_otp_expires",
    )

    op.drop_column(
        "users",
        "verification_otp",
    )

    op.drop_column(
        "users",
        "email_verified",
    )