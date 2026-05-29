from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify

routes = Blueprint('routes',__name__)

@routes.route('/')
def index():
    return jsonify({"message": "Hello World!"})