import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'fraudshield-ai-super-secret-key-2026')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, 'fraud_detection.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
