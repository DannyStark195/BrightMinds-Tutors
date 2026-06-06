import os
from dotenv import load_dotenv
import datetime
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MY_API_KEY = os.environ.get('MY_API_KEY')

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=1)

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    # MAIL_USE_TLS = False
    MAIL_USERNAME = os.environ.get('EMAIL_USER')
    MAIL_PASSWORD = os.environ.get('EMAIL_PASS')
    MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER')

config = Config()
# print(config.SQLALCHEMY_DATABASE_URI)