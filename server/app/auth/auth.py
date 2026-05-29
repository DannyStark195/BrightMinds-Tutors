from flask import Blueprint, render_template, redirect, request, url_for, current_app

auth = Blueprint('auth',__name__)

@auth.route('/')
def index():
    return "Authoritized Hello World!"