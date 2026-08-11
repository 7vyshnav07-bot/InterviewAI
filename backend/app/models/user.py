from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    # ============================================================
    # BASIC USER INFORMATION
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password = Column(
        String,
        nullable=False,
    )

    # ============================================================
    # PROFILE PICTURE
    # ============================================================

    profile_picture = Column(
        String,
        nullable=True,
    )

    # ============================================================
    # EMAIL VERIFICATION
    # ============================================================

    email_verified = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    verification_otp = Column(
        String(6),
        nullable=True,
    )

    verification_otp_expires = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # PASSWORD RESET OTP
    # ============================================================

    reset_otp = Column(
        String(6),
        nullable=True,
    )

    reset_otp_expires = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    resumes = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete",
    )

    interviews = relationship(
        "Interview",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    email_verified = Column(
    Boolean,
    default=False,
    nullable=False,
)

verification_otp = Column(
    String(6),
    nullable=True,
)

verification_otp_expires = Column(
    DateTime(timezone=True),
    nullable=True,
)

reset_otp = Column(
    String(6),
    nullable=True,
)

reset_otp_expires = Column(
    DateTime(timezone=True),
    nullable=True,
)