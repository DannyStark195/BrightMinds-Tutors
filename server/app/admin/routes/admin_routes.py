from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify, send_file
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User, Booking, Review, Course, Student, Payment
from app import db
# from app.utils.uploader import upload_profile_image
from app.utils.pricing_model import PRICING_MATRIX
# from app.utils.reference_generator import generate_reference_code, generate_payment_reference
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO


admin_routes = Blueprint('admin_routes', __name__)

@admin_routes.route('/test')
def admin_test():
    return jsonify({'message': 'welcome admin'})

@admin_routes.route('/admin', methods=['GET'])
@jwt_required()
def get_admin():
    current_user_id = get_jwt_identity() # Securely extracted from token
    print(current_user_id)
    user = User.query.get(current_user_id) # Fresh database lookup
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400
    if user.role != 'admin':  # ← this check is critical
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'admin': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
    }), 200
