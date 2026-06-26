import os
import requests
from threading import Thread

BREVO_API_KEY = os.environ.get('BREVO_API_KEY')
SENDER_EMAIL = os.environ.get('EMAIL_USER') 

def send_async_email(payload):
    """Sends the email over HTTPS Port 443 — bypassing all cloud SMTP blocks"""
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code in [200, 201, 202]:
            print(f"🚀 Email successfully delivered via Brevo API!")
        else:
            print(f"❌ Brevo API Error: {response.text}")
    except Exception as e:
        print(f"❌ Brevo Network Failure: {str(e)}")

def send_verification_email(target_email, verification_code):
    # 1. Map out Brevo's required JSON API format
    payload = {
        "sender": {
            "name": "BrightMinds Tutors",
            "email": SENDER_EMAIL
        },
        "to": [{"email": target_email}],
        "subject": "Verify Your BrightMinds Account",
        "htmlContent": f"""
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>Welcome to BrightMinds!</h2>
                <p>Please use the 6-digit verification code below to complete your registration:</p>
                <div style="font-size: 32px; font-weight: bold; padding: 15px; background-color: #f0f0f0; display: inline-block; letter-spacing: 5px; border-radius: 4px; margin: 15px 0;">
                    {verification_code}
                </div>
                <p style="color: #888;">This security code will expire in 15 minutes.</p>
            </body>
        </html>
        """
    }

    # 2. Fire-and-forget background thread execution
    Thread(target=send_async_email, args=(payload,)).start()

    # 3. Instantly return control to the auth view function
    return True