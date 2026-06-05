from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User
from app import db
from app.utils.email import send_verification_email
import random
from datetime import datetime, timedelta, timezone


auth = Blueprint('auth',__name__)


@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    data = request.get_json() or {}
    print(data)

    required_fields = ['email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email address already registered'}), 400

    email = data['email'].strip()
    username_extracted = email.split('@')[0]
    username = username_extracted.replace('.', ' ').replace('-', ' ').title()
    role = data.get('role', 'parent') 
    parent_name = data.get('parent_name')
    phone = data.get('phone')

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    otp_code = f"{random.randint(100000, 999999)}"
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=15)
    try:
        # Create new User model instance mapped to your database columns
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role=role,
            parent_name=parent_name,
            phone=phone,
            is_verified=False,
            verification_code=otp_code,
            code_expires_at=expiration_time
        )
        
        db.session.add(new_user)
        db.session.commit()

        send_verification_email(email, otp_code)

        return jsonify({
            'message': 'User registered successfully!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'role': new_user.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred', 'details': str(e)}), 500

@auth.route('/verify-code', methods=["POST"])
def verify_code():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    submitted_code = data.get('code', '').strip()
    
    if not email or not submitted_code:
        return jsonify({'error': 'Missing email or verification code'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User account not found'}), 404
        
    if user.is_verified:
        return jsonify({'message': 'Account is already verified. You can log in.'}), 200
        
    current_time = datetime.now(timezone.utc)
    db_expires_at = user.code_expires_at.replace(tzinfo=timezone.utc) if user.code_expires_at.tzinfo is None else user.code_expires_at

    if current_time > db_expires_at:
        return jsonify({'error': 'This code has expired. Please register again.'}), 400
        
    if user.verification_code != submitted_code:
        return jsonify({'error': 'Incorrect verification code. Please try again.'}), 400
        
    try:
        user.is_verified = True
        user.verification_code = None
        user.code_expires_at = None
        db.session.commit()
        
        return jsonify({'message': 'Your account has been verified successfully! You can now log in.'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    print(data)
    email = data['email']
    password = data['password']
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    if not user.is_verified:
        return jsonify({'error': 'Please check your email and verify your account before logging in.'}), 403
    
    additional_claims = {"role": user.role}
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    return jsonify({
        'message': 'Login successful!',
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'parent_name': user.parent_name
        }
    }), 200