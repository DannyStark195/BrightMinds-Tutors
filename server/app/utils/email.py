import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_verification_email(target_email, verification_code):
    # 1. Pull settings from your environment variables
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    sender_email = os.environ.get('SENDER_EMAIL')

    # If variables aren't set yet, gracefully log it and skip to prevent application crashes
    if not all([smtp_host, smtp_username, smtp_password]):
        print("⚠️ Email credentials missing! Printing code instead:", verification_code)
        return False

    # 2. Build the email headers and envelope structures
    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify Your BrightMinds Account"
    message["From"] = sender_email
    message["To"] = target_email

    # 3. Create both plain text and structured HTML versions of your message
    text_content = f"Welcome to BrightMinds! Your 6-digit verification code is: {verification_code}. It expires in 15 minutes."
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                <h2 style="color: #333;">Welcome to BrightMinds!</h2>
                <p style="color: #666; font-size: 16px;">Please use the verification code below to activate your account:</p>
                <div style="background-color: #e8f5e9; color: #2e7d32; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 6px; letter-spacing: 5px; display: inline-block; margin: 20px 0;">
                    {verification_code}
                </div>
                <p style="color: #999; font-size: 12px;">This security code will expire in 15 minutes.</p>
            </div>
        </body>
    </html>
    """

    # Attach both parts (the browser will choose the prettier HTML version automatically)
    message.attach(MIMEText(text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        # 4. Securely connect to the SMTP server using TLS encryption
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls() # Establish security layer handshake
            server.login(smtp_username, smtp_password)
            server.sendmail(sender_email, target_email, message.as_string())
        
        print(f"✅ Verification email successfully delivered to {target_email}!")
        return True

    except Exception as e:
        print(f"❌ Failed to send email via SMTP server: {str(e)}")
        return False