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
    verify_email_otp,
    resend_verification_otp,
    create_password_reset_otp,
    verify_password_reset_otp,
    reset_password_with_otp,
)

from app.services.email_service import send_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# REGISTER
# ============================================================


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check existing email
    # --------------------------------------------------------

    existing_user = get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # --------------------------------------------------------
    # Password validation
    # --------------------------------------------------------

    if len(user.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    if not any(
        char.isupper()
        for char in user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Password must contain an uppercase letter.",
        )

    if not any(
        char.islower()
        for char in user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Password must contain a lowercase letter.",
        )

    if not any(
        char.isdigit()
        for char in user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Password must contain a number.",
        )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    db_user = create_user(
        db,
        user,
    )

    # --------------------------------------------------------
    # Send verification OTP
    # --------------------------------------------------------

    await send_email(
        recipient=db_user.email,
        subject="InterviewAI - Verify Your Email",
        body=f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background-color: #0f172a;
            color: #ffffff;
            border-radius: 12px;
        ">

            <h1 style="
                color: #60a5fa;
                margin-bottom: 10px;
            ">
                Welcome to InterviewAI
            </h1>

            <p>
                Hello {db_user.name},
            </p>

            <p>
                Thank you for creating your InterviewAI account.
                Please use the verification code below to verify
                your email address.
            </p>

            <div style="
                margin: 30px 0;
                padding: 20px;
                text-align: center;
                background-color: #1e293b;
                border-radius: 10px;
            ">

                <div style="
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #60a5fa;
                ">
                    {db_user.verification_otp}
                </div>

            </div>

            <p>
                This verification code will expire in
                <strong>10 minutes</strong>.
            </p>

            <p style="color: #94a3b8;">
                If you did not create an InterviewAI account,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #334155;
                margin: 30px 0;
            ">

            <p style="
                color: #64748b;
                font-size: 13px;
            ">
                Regards,<br>
                <strong>InterviewAI</strong>
            </p>

        </div>
        """,
    )

    # --------------------------------------------------------
    # Return user
    # --------------------------------------------------------

    return db_user
    # --------------------------------------------------------
    # Check existing email
    # --------------------------------------------------------

    existing_user = get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    db_user = create_user(
        db,
        user,
    )

    # --------------------------------------------------------
    # Send verification OTP
    # --------------------------------------------------------

    await send_email(
        recipient=db_user.email,
        subject="InterviewAI - Verify Your Email",
        body=f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background-color: #0f172a;
            color: #ffffff;
            border-radius: 12px;
        ">

            <h1 style="
                color: #60a5fa;
                margin-bottom: 10px;
            ">
                Welcome to InterviewAI
            </h1>

            <p>
                Hello {db_user.name},
            </p>

            <p>
                Thank you for creating your InterviewAI account.
                Please use the verification code below to verify
                your email address.
            </p>

            <div style="
                margin: 30px 0;
                padding: 20px;
                text-align: center;
                background-color: #1e293b;
                border-radius: 10px;
            ">

                <div style="
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #60a5fa;
                ">
                    {db_user.verification_otp}
                </div>

            </div>

            <p>
                This verification code will expire in
                <strong>10 minutes</strong>.
            </p>

            <p style="color: #94a3b8;">
                If you did not create an InterviewAI account,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #334155;
                margin: 30px 0;
            ">

            <p style="
                color: #64748b;
                font-size: 13px;
            ">
                Regards,<br>
                <strong>InterviewAI</strong>
            </p>

        </div>
        """,
    )

    # --------------------------------------------------------
    # Return user
    # --------------------------------------------------------

    return db_user


# ============================================================
# VERIFY EMAIL REQUEST
# ============================================================


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str


# ============================================================
# VERIFY EMAIL
# ============================================================


@router.post("/verify-email")
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    success, message = verify_email_otp(
        db,
        data.email,
        data.otp,
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail=message,
        )

    return {
        "message": message,
    }


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
    token = login_user(
        db,
        credentials.username,
        credentials.password,
    )

    # --------------------------------------------------------
    # Invalid email/password
    # --------------------------------------------------------

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # Email not verified
    # --------------------------------------------------------

    if token.get("error") == "EMAIL_NOT_VERIFIED":
        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your email before logging in."
            ),
        )

    return token


# ============================================================
# FORGOT PASSWORD REQUEST
# ============================================================


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ============================================================
# VERIFY RESET OTP REQUEST
# ============================================================


class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# ============================================================
# RESET PASSWORD REQUEST
# ============================================================


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str


# ============================================================
# FORGOT PASSWORD
# ============================================================


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    otp = create_password_reset_otp(
        db,
        data.email,
    )

    # --------------------------------------------------------
    # Do not reveal whether email exists
    # --------------------------------------------------------

    if otp is None:
        return {
            "message": (
                "If an account exists with this email, "
                "a password reset OTP has been sent."
            )
        }

    # --------------------------------------------------------
    # Send reset OTP
    # --------------------------------------------------------

    await send_email(
        recipient=data.email,
        subject="InterviewAI - Password Reset OTP",
        body=f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
        ">

            <h2>InterviewAI Password Reset</h2>

            <p>
                We received a request to reset your InterviewAI
                account password.
            </p>

            <p>
                Your password reset OTP is:
            </p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 20px 0;
            ">
                {otp}
            </div>

            <p>
                This OTP will expire in
                <strong>10 minutes</strong>.
            </p>

            <p>
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p>
                Regards,<br>
                <strong>InterviewAI</strong>
            </p>

        </div>
        """,
    )

    return {
        "message": (
            "If an account exists with this email, "
            "a password reset OTP has been sent."
        )
    }


# ============================================================
# VERIFY RESET OTP
# ============================================================


@router.post("/verify-reset-otp")
def verify_reset_otp(
    data: VerifyResetOTPRequest,
    db: Session = Depends(get_db),
):
    success, message = verify_password_reset_otp(
        db,
        data.email,
        data.otp,
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail=message,
        )

    return {
        "message": message,
    }

# ============================================================
# RESEND EMAIL VERIFICATION OTP REQUEST
# ============================================================


class ResendVerificationOTPRequest(BaseModel):
    email: EmailStr


# ============================================================
# RESEND EMAIL VERIFICATION OTP
# ============================================================


@router.post("/resend-verification-otp")
async def resend_verification_otp_route(
    data: ResendVerificationOTPRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Generate new OTP
    # --------------------------------------------------------

    otp, message = resend_verification_otp(
        db,
        data.email,
    )

    # --------------------------------------------------------
    # Already verified
    # --------------------------------------------------------

    if otp is None:

        if message == "Email is already verified.":

            raise HTTPException(
                status_code=400,
                detail=message,
            )

        # ----------------------------------------------------
        # Cooldown
        # ----------------------------------------------------

        if message.startswith("Please wait"):

            raise HTTPException(
                status_code=429,
                detail=message,
            )

        # ----------------------------------------------------
        # User not found
        #
        # Do not reveal whether email exists.
        # ----------------------------------------------------

        return {
            "message": (
                "If an account exists with this email, "
                "a new verification OTP has been sent."
            )
        }

    # --------------------------------------------------------
    # Find user for name
    # --------------------------------------------------------

    user = get_user_by_email(
        db,
        data.email,
    )

    # --------------------------------------------------------
    # Send new OTP
    # --------------------------------------------------------

    await send_email(
        recipient=data.email,
        subject="InterviewAI - New Verification OTP",
        body=f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background-color: #0f172a;
            color: #ffffff;
            border-radius: 12px;
        ">

            <h1 style="
                color: #60a5fa;
                margin-bottom: 10px;
            ">
                InterviewAI
            </h1>

            <p>
                Hello {user.name if user else ""},
            </p>

            <p>
                You requested a new verification code
                for your InterviewAI account.
            </p>

            <div style="
                margin: 30px 0;
                padding: 20px;
                text-align: center;
                background-color: #1e293b;
                border-radius: 10px;
            ">

                <div style="
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #60a5fa;
                ">
                    {otp}
                </div>

            </div>

            <p>
                This verification code will expire in
                <strong>10 minutes</strong>.
            </p>

            <p style="color: #94a3b8;">
                If you did not request this code,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #334155;
                margin: 30px 0;
            ">

            <p style="
                color: #64748b;
                font-size: 13px;
            ">
                Regards,<br>
                <strong>InterviewAI</strong>
            </p>

        </div>
        """,
    )

    return {
        "message": (
            "A new verification OTP has been sent "
            "to your email."
        )
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
    # Password length
    # --------------------------------------------------------

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    # --------------------------------------------------------
    # Confirm password
    # --------------------------------------------------------

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    # --------------------------------------------------------
    # Reset password
    # --------------------------------------------------------

    success, message = reset_password_with_otp(
        db,
        data.email,
        data.otp,
        data.new_password,
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail=message,
        )

    return {
        "message": message,
    }


# ============================================================
# TEST EMAIL
# ============================================================


@router.post("/test-email")
async def test_email():
    await send_email(
        recipient="YOUR_EMAIL@gmail.com",
        subject="InterviewAI Email Test",
        body="""
        <h2>InterviewAI Email Test 🚀</h2>

        <p>
            If you're seeing this email,
            your SMTP configuration is working correctly.
        </p>
        """,
    )

    return {
        "message": "Test email sent successfully."
    }