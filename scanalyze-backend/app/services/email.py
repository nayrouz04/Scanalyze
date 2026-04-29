"""
app/services/email.py – Email sending service using SMTP
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import get_settings

settings = get_settings()


async def send_reset_password_email(email_to: str, reset_url: str) -> None:
    """Send a password reset email to the user."""

    subject = "Reset your Scanalyze password"

    html_content = f"""
    <html>
      <body>
        <h2>Reset your password</h2>
        <p>You requested a password reset for your Scanalyze account.</p>
        <p>Click the link below to reset your password. This link expires in 24 hours.</p>
        <a href="{reset_url}" 
           style="background-color:#4F46E5;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:6px;display:inline-block;">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email.</p>
      </body>
    </html>
    """

    # Build the email
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM
    message["To"] = email_to
    message.attach(MIMEText(html_content, "html"))

    # Send via SMTP
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, email_to, message.as_string())