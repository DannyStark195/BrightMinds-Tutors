from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

BASE_URL = "http://127.0.0.1:5500"
def create_app():
    app = Flask(__name__)
    
    from config import Config

    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": BASE_URL}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    from app import models
    
    from .routes import routes

    app.register_blueprint(routes, url_prefix='/api')

    from .auth.auth import auth
    app.register_blueprint(auth, url_prefix='/api/auth')


    return app