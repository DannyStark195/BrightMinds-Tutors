from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os 
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


BASE_URL = os.environ.get("CLIENT_BASE_URL") or "https://brightminds-tutors.vercel.app"

def create_app():
    app = Flask(__name__)
    
    from config import Config

    app.config.from_object(Config)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["https://brightminds-tutors.vercel.app"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    from app import models
    
    from .routes.routes import routes
    app.register_blueprint(routes, url_prefix='/api')

    from .auth.auth import auth, google_bp, facebook_bp
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(google_bp, url_prefix='/api/auth')
    app.register_blueprint(facebook_bp, url_prefix='/api/auth')

    with app.app_context():
        print(app.url_map)  

    from .admin.routes.admin_routes import admin_routes
    app.register_blueprint(admin_routes, url_prefix='/api/admin')

    from .admin.auth.admin_auth import admin_auth
    app.register_blueprint(admin_auth, url_prefix='/api/admin/auth')

    
    return app