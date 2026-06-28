import json
import os
from pywebpush import webpush, WebPushException
from app.models import PushSubscription

VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')
VAPID_CLAIM_EMAIL = os.environ.get('VAPID_CLAIM_EMAIL')

def send_push_notification(user_id, title, body):
    subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()
    
    for sub in subscriptions:
        try:
            webpush(
                subscription_info=json.loads(sub.subscription_json),
                data=json.dumps({"title": title, "body": body}),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_CLAIM_EMAIL}
            )
        except WebPushException as e:
            print(f"Push failed: {e}")