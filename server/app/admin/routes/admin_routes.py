from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify, send_file
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User, Booking, Review, Course, Student, Payment, TutorApplication, TutorProfile
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

@admin_routes.route('/bookings', methods=['GET'])
@jwt_required()
def get_all_bookings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    bookings = Booking.query.join(User, Booking.parent_id == User.id)\
                .filter(User.role == 'parent')\
                .all()
    return jsonify({'bookings':[b.to_dict() for b in bookings]})

@admin_routes.route('/parents', methods=['GET'])
@jwt_required()
def get_parents():
    try:
        parents = (
            User.query
            .filter(User.role == 'parent')
            .all()
        )
        print(parents)
        return jsonify(
            {
            'parents': [parent.to_dict() for parent in parents],
            'bookings': [[b.to_dict() for b in parent.bookings] for parent in parents],
            'students': [[s.to_dict() for s in parent.children] for parent in parents]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve parents.'}), 500

@admin_routes.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        students = Student.query.all()
    
        return jsonify({'students':[student.to_dict() for student in students]})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve students.'}), 500
    
@admin_routes.route('/tutors', methods=['GET'])
@jwt_required()
def get_tutors():
    try:
        tutors = (
            TutorProfile.query
            .all()
        )
        print(tutors)
        return jsonify(
            {
            'tutors': [tutor.to_dict() for tutor in tutors]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve parents.'}), 500

@admin_routes.route('/tutor-applications', methods=['GET'])
@jwt_required()
def get_tutor_applications():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    applications = TutorApplication.query.order_by(TutorApplication.created_at.desc()).all()
    
    return jsonify({'applications': [application.to_dict() for application in applications]}), 200