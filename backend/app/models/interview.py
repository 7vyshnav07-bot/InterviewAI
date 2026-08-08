from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role = Column(
        String(100),
        nullable=False,
    )

    difficulty = Column(
        String(50),
        nullable=False,
    )

    completed = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="interviews",
    )

    questions = relationship(
        "InterviewQuestion",
        back_populates="interview",
        cascade="all, delete-orphan",
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    interview_id = Column(
        Integer,
        ForeignKey(
            "interviews.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    question_id = Column(
        Integer,
        nullable=False,
    )

    question_type = Column(
        String(50),
        nullable=False,
    )

    question = Column(
        Text,
        nullable=False,
    )

    answer = Column(
        Text,
        nullable=True,
    )

    score = Column(
        Float,
        nullable=True,
    )

    feedback = Column(
        Text,
        nullable=True,
    )

    ideal_answer = Column(
        Text,
        nullable=True,
    )

    strengths = Column(
        Text,
        nullable=True,
    )

    improvements = Column(
        Text,
        nullable=True,
    )

    interview = relationship(
        "Interview",
        back_populates="questions",
    )