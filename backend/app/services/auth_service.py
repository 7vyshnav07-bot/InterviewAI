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
# CREATE PASSWORD RESET TOKEN
# ============================================================

def create_password_reset_token(
    db: Session,
    email: str,
):
    user = get_user_by_email(
        db,
        email,
    )

    # Email doesn't exist
    if not user:
        return None

    # Generate secure random token
    token = secrets.token_urlsafe(32)

    # Token expires after 30 minutes
    expires = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    user.reset_token = token
    user.reset_token_expires = expires

    db.commit()
    db.refresh(user)

    return token


# ============================================================
# RESET PASSWORD
# ============================================================

def reset_password(
    db: Session,
    token: str,
    new_password: str,
):
    # Find user using reset token
    user = (
        db.query(User)
        .filter(
            User.reset_token == token
        )
        .first()
    )

    # Token doesn't exist
    if not user:
        return (
            False,
            "Invalid or expired reset token.",
        )

    # Token has no expiry
    if not user.reset_token_expires:
        return (
            False,
            "Invalid or expired reset token.",
        )

    expires = user.reset_token_expires

    # Handle timezone-naive datetime
    if expires.tzinfo is None:
        expires = expires.replace(
            tzinfo=timezone.utc
        )

    current_time = datetime.now(
        timezone.utc
    )

    # Check expiration
    if current_time > expires:

        # Remove expired token
        user.reset_token = None
        user.reset_token_expires = None

        db.commit()

        return (
            False,
            "Reset token has expired.",
        )

    # Hash new password
    user.hashed_password = hash_password(
        new_password
    )

    # IMPORTANT:
    # Invalidate the token after use
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()
    db.refresh(user)

    return (
        True,
        "Password reset successfully.",
    )