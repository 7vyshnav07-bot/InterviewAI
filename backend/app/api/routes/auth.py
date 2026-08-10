from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.dependencies import get_db

from app.schemas.user import (
    UserCreate,
    UserResponse,
)

from app.schemas.auth import Token

from app.services.auth_service import (
    create_user,
    get_user_by_email,
    login_user,
    hash_password,
)

import secrets
from datetime import datetime, timedelta, timezone


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# TEMPORARY PASSWORD RESET STORAGE
# ============================================================

password_reset_tokens = {}


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return create_user(
        db,
        user,
    )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=Token,
)
def login(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login using OAuth2 password form.

    Swagger sends:

        username=<email>
        password=<password>

    We use the username field as the user's email.
    """

    token = login_user(
        db,
        credentials.username,
        credentials.password,
    )

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return token


# ============================================================
# FORGOT PASSWORD REQUEST
# ============================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ============================================================
# RESET PASSWORD REQUEST
# ============================================================

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        data.email,
    )

    # --------------------------------------------------------
    # Do not reveal whether the email exists
    # --------------------------------------------------------

    if not user:
        return {
            "message": (
                "If an account exists with this email, "
                "a password reset link has been sent."
            )
        }

    # --------------------------------------------------------
    # Generate secure reset token
    # --------------------------------------------------------

    token = secrets.token_urlsafe(32)

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=15)
    )

    password_reset_tokens[token] = {
        "user_id": user.id,
        "expires_at": expires_at,
    }

    # --------------------------------------------------------
    # TEMPORARY DEVELOPMENT VERSION
    # --------------------------------------------------------
    #
    # For now we return the reset token so you can test
    # the complete flow without configuring email/SMTP.
    #
    # Later we will replace this with actual email sending.
    # --------------------------------------------------------

    return {
        "message": (
            "If an account exists with this email, "
            "a password reset link has been sent."
        ),
        "reset_token": token,
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find token
    # --------------------------------------------------------

    reset_data = password_reset_tokens.get(
        data.token
    )

    if not reset_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired password reset token.",
        )

    # --------------------------------------------------------
    # Check expiration
    # --------------------------------------------------------

    if (
        datetime.now(timezone.utc)
        > reset_data["expires_at"]
    ):
        password_reset_tokens.pop(
            data.token,
            None,
        )

        raise HTTPException(
            status_code=400,
            detail="Password reset token has expired.",
        )

    # --------------------------------------------------------
    # Validate password
    # --------------------------------------------------------

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least "
                "8 characters long."
            ),
        )

    # --------------------------------------------------------
    # Confirm password
    # --------------------------------------------------------

    if (
        data.new_password
        != data.confirm_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == reset_data["user_id"]
        )
        .first()
    )

    if not user:
        password_reset_tokens.pop(
            data.token,
            None,
        )

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # Update password
    # --------------------------------------------------------

    user.hashed_password = hash_password(
        data.new_password
    )

    db.commit()

    # --------------------------------------------------------
    # Delete token so it cannot be reused
    # --------------------------------------------------------

    password_reset_tokens.pop(
        data.token,
        None,
    )

    return {
        "message": "Password reset successfully."
    }