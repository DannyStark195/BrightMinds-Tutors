from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User
from app import db
routes = Blueprint('routes',__name__)

@routes.route('/')
def index():
    return jsonify({"message": "Hello World!"})


@routes.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity() # Securely extracted from token
    print(current_user_id)
    user = User.query.get(current_user_id) # Fresh database lookup
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'parent_name': user.parent_name,
            'phone': user.phone
        }
    }), 200

@routes.route('/edit-profile', methods=['POST'])
@jwt_required()
def edit_profile():
    data = request.get_json() or {}
    print(data)
    new_username = data.get('username')
    new_phone = data.get('phone')
    print(new_phone)
    current_user_id = get_jwt_identity() 
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400

    user.username = new_username
    user.phone = new_phone

    try:
        db.session.commit()
    
        return jsonify({'message': "User profile edited!"}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to edit profile! Please try again.'}), 400