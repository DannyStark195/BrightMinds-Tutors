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


def send_booking_approved_email(target_email, parent_name, tutor_name, subject_name, schedule):
    """Sent to parent when their booking is confirmed by admin"""
    payload = {
        "sender": {"name": "BrightMinds Tutors", "email": SENDER_EMAIL},
        "to": [{"email": target_email}],
        "subject": "Your Booking is Confirmed — BrightMinds Tutors",
        "htmlContent": f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #0D1B2A;">Booking Confirmed ✅</h2>
            <p>Hi {parent_name},</p>
            <p>Great news! Your tutoring booking has been confirmed. Here are your session details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f9f8f4;">
                <td style="padding: 10px 14px; font-weight: bold; color: #0D1B2A;">Tutor</td>
                <td style="padding: 10px 14px;">{tutor_name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #0D1B2A;">Subject</td>
                <td style="padding: 10px 14px;">{subject_name}</td>
              </tr>
              <tr style="background: #f9f8f4;">
                <td style="padding: 10px 14px; font-weight: bold; color: #0D1B2A;">Schedule</td>
                <td style="padding: 10px 14px;">{schedule}</td>
              </tr>
            </table>
            <p>Your tutor will be in touch shortly to arrange your first session. If you have any questions, feel free to reply to this email.</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">— The BrightMinds Team</p>
          </body>
        </html>
        """
    }
    Thread(target=send_async_email, args=(payload,)).start()
    return True



def send_booking_rejected_email(target_email, parent_name, reason=None):
    """Sent to parent when their booking is rejected by admin"""

    reason_block = f"""
        <div style="background: #fff3f3; border-left: 4px solid #e53935; padding: 12px 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; color: #b71c1c; font-size: 14px;"><strong>Reason:</strong> {reason}</p>
        </div>
    """ if reason else ""
    payload = {
        "sender": {"name": "BrightMinds Tutors", "email": SENDER_EMAIL},
        "to": [{"email": target_email}],
        "subject": "Your Booking is Rejected — BrightMinds Tutors",
        "htmlContent": f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #0D1B2A;">Booking Rejected ❌</h2>
            <p>Hi {parent_name},</p>
            <p>Thank you for applying to join the BrightMinds tutor network. After reviewing your booking, we're unable to move forward at this time.</p>
            {reason_block}
            <p>We encourage you to book again. Thank you</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">— The BrightMinds Team</p>
          </body>
        </html>
        """
    }
    Thread(target=send_async_email, args=(payload,)).start()
    return True



def send_application_approved_email(target_email, tutor_name):
    """Sent to tutor when admin approves their application"""
    payload = {
        "sender": {"name": "BrightMinds Tutors", "email": SENDER_EMAIL},
        "to": [{"email": target_email}],
        "subject": "Your Tutor Application Has Been Approved 🎉",
        "htmlContent": f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #0D1B2A;">Welcome to BrightMinds!</h2>
            <p>Hi {tutor_name},</p>
            <p>We're excited to let you know that your tutor application has been <strong style="color: #2e7d32;">approved</strong>.</p>
            <p>You can now log in to your dashboard to complete your profile, set your availability, and start receiving bookings.</p>
            <div style="margin: 28px 0;">
              <a href="https://brightminds-tutors.vercel.app/tutor-dashboard"
                 style="background: #F5A623; color: #0D1B2A; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p>If you have any questions, reply to this email — we're happy to help.</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">— The BrightMinds Team</p>
          </body>
        </html>
        """
    }
    Thread(target=send_async_email, args=(payload,)).start()
    return True


def send_application_rejected_email(target_email, tutor_name, reason=None):
    """Sent to tutor when admin rejects their application"""
    reason_block = f"""
        <div style="background: #fff3f3; border-left: 4px solid #e53935; padding: 12px 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; color: #b71c1c; font-size: 14px;"><strong>Reason:</strong> {reason}</p>
        </div>
    """ if reason else ""

    payload = {
        "sender": {"name": "BrightMinds Tutors", "email": SENDER_EMAIL},
        "to": [{"email": target_email}],
        "subject": "Update on Your BrightMinds Tutor Application",
        "htmlContent": f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #0D1B2A;">Application Update</h2>
            <p>Hi {tutor_name},</p>
            <p>Thank you for applying to join the BrightMinds tutor network. After reviewing your application, we're unable to move forward at this time.</p>
            {reason_block}
            <p>We encourage you to reapply in the future if your circumstances change. We wish you all the best.</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">— The BrightMinds Team</p>
          </body>
        </html>
        """
    }
    Thread(target=send_async_email, args=(payload,)).start()
    return True