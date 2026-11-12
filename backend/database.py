import sqlite3
import os
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Fraud Analyst',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Transactions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        merchant_name TEXT,
        merchant_category TEXT,
        transaction_date TEXT,
        transaction_time TEXT,
        device_type TEXT,
        device_id TEXT,
        is_new_device INTEGER DEFAULT 0,
        ip_address TEXT,
        country TEXT,
        state TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL,
        distance_from_usual_location REAL,
        foreign_transaction INTEGER DEFAULT 0,
        transactions_last_hour INTEGER DEFAULT 0,
        transactions_last_24_hours INTEGER DEFAULT 0,
        failed_login_attempts INTEGER DEFAULT 0,
        otp_verified INTEGER DEFAULT 1,
        two_factor_auth INTEGER DEFAULT 1,
        vpn_detected INTEGER DEFAULT 0,
        proxy_detected INTEGER DEFAULT 0,
        account_age INTEGER DEFAULT 12,
        previous_fraud_cases INTEGER DEFAULT 0,
        fraud_probability REAL NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        prediction TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Fraud Alerts Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fraud_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id)
    )
    ''')

    # Predictions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        prediction TEXT NOT NULL,
        fraud_probability REAL NOT NULL,
        risk_score INTEGER NOT NULL,
        model_version TEXT DEFAULT 'v2.4-DeepXAI',
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id)
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
