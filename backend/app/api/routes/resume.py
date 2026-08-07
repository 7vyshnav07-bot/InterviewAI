from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from app.services.resume_service import delete_resume
from app.api.dependencies import (
    get_db,
    get_current_user,
)

from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.resume_service import save_resume

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


@router.post(
    "/upload",
    response_model=ResumeResponse,
)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    return save_resume(
    db,
    file,
    current_user.id,
)
from app.services.resume_service import (
    save_resume,
    get_latest_resume,
)
@router.get(
    "/latest",
    response_model=ResumeResponse,
)
def latest_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = get_latest_resume(
    db,
    current_user.id,
)

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    return resume
@router.delete("/delete")
def remove_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = delete_resume(db, current_user.id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    return {"message": "Resume deleted successfully"}