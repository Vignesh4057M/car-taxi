import os
import secrets

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(16))
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(BASE_DIR, 'taxi_system.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_USER = os.getenv('ADMIN_USER', 'admin')
    ADMIN_PASS = os.getenv('ADMIN_PASS', 'admin123')
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:3000'
    ).split(',')
    SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'None')
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
