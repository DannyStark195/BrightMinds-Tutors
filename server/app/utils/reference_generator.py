import random
import string
from datetime import datetime
import secrets
def generate_reference_code():
    """Generates a unique transaction reference for tracking"""
    return f"BM-{secrets.token_hex(2).upper()}"



def generate_payment_reference(payment_method):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    if payment_method == 'card':
        return f"CARD-{timestamp}-{random_chars}"
    elif payment_method == 'bank_transfer':
        return f"BANK-{timestamp}-{random_chars}"
    elif payment_method == 'ussd':
        return f"USSD-{timestamp}-{random_chars}"
    elif payment_method == 'paystack':
        return f"SIM-{timestamp}-{random_chars}"
    else:
        raise ValueError(f"Invalid payment method: {payment_method}")