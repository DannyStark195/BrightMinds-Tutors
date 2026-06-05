from flask_mail import Message
from app import mail # 🔑 Import the initialized mail instance from your app package

def send_verification_email(target_email, verification_code):
    # 1. Create the Message wrapper
    msg = Message(
        subject="Verify Your BrightMinds Account",
        recipients=[target_email]
    )
    
    # 2. Build out your layout copies
    msg.body = f"Welcome! Your verification code is: {verification_code}"
    msg.html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Welcome to BrightMinds!</h2>
            <p>Please use the 6-digit verification code below to activate your account:</p>
            <div style="font-size: 32px; font-weight: bold; padding: 15px; background-color: #f0f0f0; display: inline-block; letter-spacing: 5px; border-radius: 4px;">
                {verification_code}
            </div>
            <p style="color: #888;">This security code will expire in 15 minutes.</p>
        </body>
    </html>
    """

    try:
        # 3. Fire it off using the app's global mail configurations
        mail.send(msg)
        print(f"✅ Email delivered via Flask-Mail to {target_email}!")
        return True
    except Exception as e:
        print(f"❌ Flask-Mail Failure: {str(e)}")
        # Keeping our fallback log so your manual frontend tests never get locked out
        print(f"Fallback verification code for {target_email}: {verification_code}")
        return False