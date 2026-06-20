from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, decode_token
from app.models import User
from app import db
import random
from datetime import datetime, timedelta, timezone

admin_auth = Blueprint('admin_auth', __name__)

@admin_auth.route('/test', methods=["GET"])
def admin_test():
    return 'welcome admin'

@admin_auth.route('/login', methods=['POST'])
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
            # 'parent_name': user.parent_name
        }
    }), 200