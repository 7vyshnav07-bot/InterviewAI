import os
from dotenv import load_dotenv
from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig,
    MessageType,
)

load_dotenv()


# ============================================================
# EMAIL CONFIGURATION
# ============================================================

mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv(
        "MAIL_SERVER",
        "smtp.gmail.com",
    ),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


# ============================================================
# SEND EMAIL
# ============================================================

async def send_email(
    recipient: str,
    subject: str,
    body: str,
):
    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=body,
        subtype=MessageType.html,
    )

    fast_mail = FastMail(mail_config)

    await fast_mail.send_message(message)