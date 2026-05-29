from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from .routes import routes
from .auth.auth import auth

db = SQLAlchemy()
BASE_URL = "http://127.0.0.1:5500"
def create_app():
    app = Flask(__name__)
    
    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": BASE_URL}})

    db.init_app(app)
    
    app.register_blueprint(routes, url_prefix='/api')

    app.register_blueprint(auth, url_prefix='/api/auth')


    return app