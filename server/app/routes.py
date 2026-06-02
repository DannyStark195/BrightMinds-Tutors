from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User

routes = Blueprint('routes',__name__)

@routes.route('/')
def index():
    return jsonify({"message": "Hello World!"})


@routes.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity() # Securely extracted from token
    user = User.query.get(current_user_id) # Fresh database lookup
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'parent_name': user.parent_name
        }
    }), 200