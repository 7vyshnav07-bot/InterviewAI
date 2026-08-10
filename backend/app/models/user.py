from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

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

    profile_picture = Column(
        String,
        nullable=True,
    )

    reset_token = Column(
        String(255),
        nullable=True,
        unique=True,
    )

    reset_token_expires = Column(
        DateTime(timezone=True),
        nullable=True,
    )

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