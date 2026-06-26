from threading import Thread
from flask import current_app
from flask_mail import Message
from app import mail  # Import your initialized mail instance
import socket

def send_async_email(app, msg, target_email, verification_code):
    """
    Executes inside a background thread context. 
    It will attempt to deliver the email but won't hold up the main client request loop.
    """
    # 🌟 Bind the active app context to this background thread
    with app.app_context():
        try:
            # Prevent endless blocking by enforcing a 10-second connection timeout ceiling
            socket.setdefaulttimeout(10.0)
            mail.send(msg)
            print(f"✅ Email delivered via background thread to {target_email}!")
        except Exception as e:
            print(f"❌ Flask-Mail Thread Failure: {str(e)}")
            # Fallback log stays active inside your server logs for local testing references
            print(f"Fallback verification code for {target_email}: {verification_code}")

def send_verification_email(target_email, verification_code):
    # 1. Capture the true native Flask app instance context proxy
    app = current_app._get_current_object()

    # 2. Create the Message wrapper
    msg = Message(
        subject="Verify Your BrightMinds Account",
        recipients=[target_email]
    )
    
    # 3. Build out your layout copies
    msg.body = f"Welcome! Your verification code is: {verification_code}"
    msg.html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Welcome to BrightMinds!</h2>
            <p>Please use the 6-digit verification code</p>
            <div style="font-size: 32px; font-weight: bold; padding: 15px; background-color: #f0f0f0; display: inline-block; letter-spacing: 5px; border-radius: 4px;">
                {verification_code}
            </div>
            <p style="color: #888;">This security code will expire in 15 minutes.</p>
        </body>
    </html>
    """

    # 4. 🚀 SPIN UP SIDE-WORKER THREAD
    # Passes the app context instance, email message entity, and fallback data parameters
    Thread(target=send_async_email, args=(app, msg, target_email, verification_code)).start()

    # 5. INSTANT COMPLETED SIGNAL
    # We immediately return True so your auth signup route finishes processing instantly!
    return True