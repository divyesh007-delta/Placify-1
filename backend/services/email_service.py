import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class EmailService:
    def __init__(self):
        """Initialize email service with SMTP configuration."""
        self.smtp_server = os.getenv('SMTP_SERVER')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL')


    def send_otp_email(self, to_email: str, otp: str) -> bool:
    

     try:
        

        if not all([self.smtp_server, self.smtp_username, self.smtp_password]):
            return False

        # STEP 2: Prepare email content
        subject = "Your Verification OTP - BVM Placement Portal"
        text_content = f"""
BVM Placement Portal - Email Verification

Your OTP for email verification is: {otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
BVM Placement Cell
"""
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; }}
        .otp {{ font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; }}
        .footer {{ margin-top: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>BVM Placement Portal</h2>
        </div>
        <h3>Email Verification OTP</h3>
        <p>Dear Student,</p>
        <p>Your OTP for email verification is:</p>
        <div class="otp">{otp}</div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
            <p>Best regards,<br>BVM Placement Cell</p>
        </div>
    </div>
</body>
</html>
"""

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.from_email or self.smtp_username
        msg['To'] = to_email
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

    

        # STEP 3: Connect to SMTP server
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.set_debuglevel(1)  # Print SMTP communication
            server.ehlo()

            # STEP 4: Enable TLS
            if self.smtp_port == 587:
                server.starttls()
                server.ehlo()

            # STEP 5: Login to SMTP server
            try:
                server.login(self.smtp_username, self.smtp_password)
            except smtplib.SMTPAuthenticationError as e:
                return False

            # STEP 6: Send the email
            server.send_message(msg)

        return True

     except smtplib.SMTPAuthenticationError as e:
        print(f"❌ [SMTPAuthenticationError] {e}")
        return False
     except smtplib.SMTPConnectError as e:
        print(f"❌ [SMTPConnectError] {e}")
        return False
     except smtplib.SMTPException as e:
        print(f"❌ [SMTPException] {e}")
        return False
     except Exception as e:
        print(f"❌ [General Exception] Failed to send email to {to_email}: {e}")
        return False
