import os
import requests

def send_verification_email(target_email, verification_code):
    api_key = os.environ.get('RESEND_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

    if not api_key:
        print(f"⚠️ RESEND_API_KEY missing! Code for {target_email}: {verification_code}")
        return False

    # The API endpoint provided by Resend for direct web requests
    url = "https://api.resend.com/emails"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": sender_email,
        "to": target_email,
        "subject": "Verify Your BrightMinds Account",
        "html": f"""
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>Welcome to BrightMinds!</h2>
                <p>Please use the verification code below to activate your account:</p>
                <div style="font-size: 32px; font-weight: bold; padding: 15px; background-color: #f0f0f0; display: inline-block; letter-spacing: 5px;">
                    {verification_code}
                </div>
                <p>This security code will expire in 15 minutes.</p>
            </body>
        </html>
        """
    }

    try:
        # Fire a quick web request with a 5-second timeout safety net
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        
        if response.status_code in [200, 201]:
            print(f"✅ Email successfully pushed via API to {target_email}!")
            return True
        else:
            print(f"❌ Resend API Error ({response.status_code}): {response.text}")
            # Fallback log so you don't get locked out while testing locally
            print(f"Fallback verification code for {target_email}: {verification_code}")
            return False

    except Exception as e:
        print(f"❌ Failed to reach Resend API: {str(e)}")
        print(f"Fallback verification code for {target_email}: {verification_code}")
        return False