import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DB_URI', 'sqlite:///gatex.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
