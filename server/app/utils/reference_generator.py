import secrets
def generate_reference_code():
    """Generates a unique transaction reference for tracking"""
    return f"BM-{secrets.token_hex(4).upper()}"