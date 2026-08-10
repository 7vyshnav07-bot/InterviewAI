import os
import uuid
from pathlib import Path
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    get_db,
)
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.security import (
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ============================================================
# UPDATE PROFILE REQUEST
# ============================================================

class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr


# ============================================================
# CHANGE PASSWORD REQUEST
# ============================================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put(
    "/me",
    response_model=UserResponse,
)
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    # --------------------------------------------------------
    # Validate name
    # --------------------------------------------------------

    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty.",
        )

    # --------------------------------------------------------
    # Check email
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == data.email,
            User.id != current_user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered.",
        )

    # --------------------------------------------------------
    # Update user
    # --------------------------------------------------------

    current_user.name = name
    current_user.email = data.email

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put("/me/password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    # --------------------------------------------------------
    # Validate current password
    # --------------------------------------------------------

    if not verify_password(
        data.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # --------------------------------------------------------
    # Validate new password
    # --------------------------------------------------------

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be at least "
                "8 characters long."
            ),
        )

    # --------------------------------------------------------
    # Confirm new password
    # --------------------------------------------------------

    if (
        data.new_password
        != data.confirm_password
    ):
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match.",
        )

    # --------------------------------------------------------
    # Don't allow same password
    # --------------------------------------------------------

    if verify_password(
        data.new_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different "
                "from your current password."
            ),
        )

    # --------------------------------------------------------
    # Hash and save new password
    # --------------------------------------------------------

    current_user.hashed_password = hash_password(
        data.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }


# ============================================================
# DELETE ACCOUNT
# ============================================================

@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    # --------------------------------------------------------
    # Delete current user
    # --------------------------------------------------------

    db.delete(current_user)

    db.commit()

    return {
        "message": "Account deleted successfully."
    }
# ============================================================
# UPLOAD PROFILE PICTURE
# ============================================================

@router.post("/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, and WebP "
                "images are allowed."
            ),
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    image_data = await file.read()

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="Image file is empty.",
        )

    # --------------------------------------------------------
    # Limit file size to 5 MB
    # --------------------------------------------------------

    max_size = 5 * 1024 * 1024

    if len(image_data) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Profile picture must be smaller than 5 MB.",
        )

    # --------------------------------------------------------
    # Create upload directory
    # --------------------------------------------------------

    upload_dir = Path(
        "uploads/profile_pictures"
    )

    upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    extension = allowed_types[
        file.content_type
    ]

    filename = (
        f"{current_user.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = upload_dir / filename

    # --------------------------------------------------------
    # Save image
    # --------------------------------------------------------

    with open(file_path, "wb") as image_file:
        image_file.write(image_data)

    # --------------------------------------------------------
    # Delete previous picture
    # --------------------------------------------------------

    if current_user.profile_picture:

        old_path = Path(
            current_user.profile_picture
        )

        if old_path.exists():
            old_path.unlink()

    # --------------------------------------------------------
    # Save path in database
    # --------------------------------------------------------

    current_user.profile_picture = str(
        file_path
    ).replace("\\", "/")

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture uploaded successfully.",
        "profile_picture": current_user.profile_picture,
    }
# ============================================================
# REMOVE PROFILE PICTURE
# ============================================================

@router.delete(
    "/me/profile-picture",
    response_model=UserResponse,
)
def remove_profile_picture(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.profile_picture = None

    db.commit()
    db.refresh(current_user)

    return current_user