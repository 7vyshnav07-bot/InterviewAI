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
    """
    Generate a password reset OTP and send it
    to the user's email.
    """

    # --------------------------------------------------------
    # Generate OTP
    # --------------------------------------------------------

    otp = create_password_reset_otp(
        db,
        data.email,
    )

    # --------------------------------------------------------
    # Do not reveal whether the email exists
    # --------------------------------------------------------

    if otp is None:
        return {
            "message": (
                "If an account exists with this email, "
                "a password reset OTP has been sent."
            )
        }

    # --------------------------------------------------------
    # Send OTP through email
    # --------------------------------------------------------

    await send_email(
        recipient=data.email,
        subject="InterviewAI Password Reset OTP",
        body=f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: auto;
            padding: 30px;
            background-color: #0f172a;
            color: white;
            border-radius: 12px;
        ">

            <h2 style="color: #60a5fa;">
                InterviewAI Password Reset
            </h2>

            <p>
                We received a request to reset the password
                for your InterviewAI account.
            </p>

            <p>
                Your verification code is:
            </p>

            <div style="
                margin: 25px 0;
                padding: 18px;
                text-align: center;
                background-color: #1e293b;
                border-radius: 10px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #60a5fa;
            ">
                {otp}
            </div>

            <p>
                This OTP is valid for
                <strong>10 minutes</strong>.
            </p>

            <p style="color: #94a3b8;">
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #334155;
                margin: 25px 0;
            ">

            <p style="
                color: #64748b;
                font-size: 12px;
            ">
                InterviewAI
            </p>

        </div>
        """,
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

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
    """
    Verify the password reset OTP.
    """

    # --------------------------------------------------------
    # Validate OTP format
    # --------------------------------------------------------

    if not data.otp.isdigit() or len(data.otp) != 6:
        raise HTTPException(
            status_code=400,
            detail="OTP must be exactly 6 digits.",
        )

    # --------------------------------------------------------
    # Verify OTP
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Success
    # --------------------------------------------------------

    return {
        "message": message,
    }


# ============================================================
# RESET PASSWORD
# ============================================================


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password using email + OTP.
    """

    # --------------------------------------------------------
    # Validate password length
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

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    # --------------------------------------------------------
    # Validate OTP format
    # --------------------------------------------------------

    if not data.otp.isdigit() or len(data.otp) != 6:
        raise HTTPException(
            status_code=400,
            detail="OTP must be exactly 6 digits.",
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

    # --------------------------------------------------------
    # Invalid / expired OTP
    # --------------------------------------------------------

    if not success:
        raise HTTPException(
            status_code=400,
            detail=message,
        )

    # --------------------------------------------------------
    # Success
    # --------------------------------------------------------

    return {
        "message": message,
    }


# ============================================================
# TEST EMAIL
# ============================================================


@router.post("/test-email")
async def test_email():

    await send_email(
        recipient="7vyshnav07@gmail.com",
        subject="InterviewAI Email Test",
        body="""
        <div style="
            font-family: Arial, sans-serif;
            padding: 30px;
        ">

            <h2>
                InterviewAI Email Test 🚀
            </h2>

            <p>
                If you're seeing this email,
                your SMTP configuration is working correctly.
            </p>

        </div>
        """,
    )

    return {
        "message": "Test email sent successfully."
    }