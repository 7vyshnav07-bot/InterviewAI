import os
import shutil

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.ai.resume_analyzer import analyze_resume
from app.models.resume import Resume
from app.utils.pdf_parser import extract_text_from_pdf


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_resume(
    db: Session,
    file: UploadFile,
    user_id: int,
):
    # Save uploaded PDF
    filepath = os.path.join(
        UPLOAD_DIR,
        file.filename,
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    resume_text = extract_text_from_pdf(filepath)

    # Analyze resume using Groq
    analysis = analyze_resume(resume_text)

    # Debug output
    print("=" * 60)
    print("AI ANALYSIS")
    print(analysis)
    print(type(analysis))
    print("=" * 60)

    # Save to database
    resume = Resume(
        filename=file.filename,
        filepath=filepath,
        resume_text=resume_text,
        analysis_json=analysis,
        user_id=user_id,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


def get_latest_resume(
    db: Session,
    user_id: int,
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.id.desc())
        .first()
    )
def delete_resume(db: Session, user_id: int):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.id.desc())
        .first()
    )

    if resume is None:
        return None

    if os.path.exists(resume.filepath):
        os.remove(resume.filepath)

    db.delete(resume)
    db.commit()

    return True