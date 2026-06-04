from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import json
from app.models import User
from app import db
from app.utils.email import send_verification_email
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
    try:
        # Create new User model instance mapped to your database columns
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role=role,
            parent_name=parent_name,
            phone=phone
        )
        
        db.session.add(new_user)
        db.session.commit()
        
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

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    print(data)
    email = data['email']
    password = data['password']
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
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