from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, decode_token
from app.models import User
from app import db
import random
from datetime import datetime, timedelta, timezone

admin_routes = Blueprint('admin_', __name__)

@admin_routes.route('/test')
def admin_test():
    return jsonify({'message': 'welcome admin'})