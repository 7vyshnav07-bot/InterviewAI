import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


# ============================================================
# GET USER BY EMAIL
# ============================================================

def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


# ============================================================
# CREATE USER
# ============================================================

def create_user(
    db: Session,
    user: UserCreate,
):
    hashed_password = hash_password(
        user.password
    )

    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ============================================================
# AUTHENTICATE USER
# ============================================================

def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    return user


# ============================================================
# LOGIN USER
# ============================================================

def login_user(
    db: Session,
    email: str,
    password: str,
):
    user = authenticate_user(
        db,
        email,
        password,
    )

    if not user:
        return None

    access_token = create_access_token(
        data={
            "sub": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ============================================================
# CREATE PASSWORD RESET OTP
# ============================================================

def create_password_reset_otp(
    db: Session,
    email: str,
):
    user = get_user_by_email(
        db,
        email,
    )

    # --------------------------------------------------------
    # Email does not exist
    # --------------------------------------------------------

    if not user:
        return None

    # --------------------------------------------------------
    # Generate secure 6-digit OTP
    # --------------------------------------------------------

    otp = f"{secrets.randbelow(1_000_000):06d}"

    # --------------------------------------------------------
    # OTP expires after 10 minutes
    # --------------------------------------------------------

    expires = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    # --------------------------------------------------------
    # Store OTP
    # --------------------------------------------------------

    user.reset_otp = otp
    user.reset_otp_expires = expires

    db.commit()
    db.refresh(user)

    return otp


# ============================================================
# VERIFY PASSWORD RESET OTP
# ============================================================

def verify_password_reset_otp(
    db: Session,
    email: str,
    otp: str,
):
    user = get_user_by_email(
        db,
        email,
    )

    # --------------------------------------------------------
    # User not found
    # --------------------------------------------------------

    if not user:
        return (
            False,
            "Invalid or expired OTP.",
        )

    # --------------------------------------------------------
    # No OTP stored
    # --------------------------------------------------------

    if not user.reset_otp:
        return (
            False,
            "Invalid or expired OTP.",
        )

    # --------------------------------------------------------
    # No expiry stored
    # --------------------------------------------------------

    if not user.reset_otp_expires:
        return (
            False,
            "Invalid or expired OTP.",
        )

    # --------------------------------------------------------
    # Handle timezone-naive datetime
    # --------------------------------------------------------

    expires = user.reset_otp_expires

    if expires.tzinfo is None:
        expires = expires.replace(
            tzinfo=timezone.utc
        )

    # --------------------------------------------------------
    # Check expiry
    # --------------------------------------------------------

    current_time = datetime.now(
        timezone.utc
    )

    if current_time > expires:

        user.reset_otp = None
        user.reset_otp_expires = None

        db.commit()

        return (
            False,
            "OTP has expired.",
        )

    # --------------------------------------------------------
    # Check OTP
    # --------------------------------------------------------

    if user.reset_otp != otp:
        return (
            False,
            "Invalid OTP.",
        )

    # --------------------------------------------------------
    # OTP is valid
    # --------------------------------------------------------

    return (
        True,
        "OTP verified successfully.",
    )


# ============================================================
# RESET PASSWORD USING OTP
# ============================================================

def reset_password_with_otp(
    db: Session,
    email: str,
    otp: str,
    new_password: str,
):
    # --------------------------------------------------------
    # Verify OTP first
    # --------------------------------------------------------

    success, message = verify_password_reset_otp(
        db,
        email,
        otp,
    )

    if not success:
        return (
            False,
            message,
        )

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        return (
            False,
            "User not found.",
        )

    # --------------------------------------------------------
    # Update password
    # --------------------------------------------------------

    user.hashed_password = hash_password(
        new_password
    )

    # --------------------------------------------------------
    # Invalidate OTP after successful reset
    # --------------------------------------------------------

    user.reset_otp = None
    user.reset_otp_expires = None

    db.commit()
    db.refresh(user)

    return (
        True,
        "Password reset successfully.",
    )