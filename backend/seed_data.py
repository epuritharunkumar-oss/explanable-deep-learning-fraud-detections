import sqlite3
import json
import hashlib
from config import Config
from ml.fraud_predictor import predict_transaction

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

from database import init_db

def seed_database():
    init_db()
    conn = sqlite3.connect(Config.DATABASE_PATH)
    cursor = conn.cursor()

    # Clear existing
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM fraud_alerts")
    cursor.execute("DELETE FROM predictions")

    # 1. Seed Users
    users = [
        ("Tharun Prakash", "tharun@fraudshield.ai", "+91 98765 43210", hash_pw("admin123"), "Fraud Analyst"),
        ("Sarah Jenkins", "sarah@fraudshield.ai", "+1 415 555 0199", hash_pw("password123"), "Administrator"),
        ("David Kumar", "david@bankpartner.com", "+91 91234 56789", hash_pw("bankuser123"), "Bank Employee")
    ]
    cursor.executemany("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)", users)

    # 2. Seed Realistic Transactions
    sample_raw_txns = [
        {
            "transaction_id": "TXN1001",
            "customer_id": "CUST8810",
            "amount": 2500.0,
            "transaction_type": "UPI",
            "merchant_name": "FreshMart Groceries",
            "merchant_category": "Groceries",
            "transaction_date": "2026-09-10",
            "transaction_time": "14:15:22",
            "device_type": "Mobile",
            "device_id": "DEV-ANDR-881",
            "is_new_device": 0,
            "ip_address": "103.24.18.90",
            "country": "India",
            "state": "Karnataka",
            "city": "Bengaluru",
            "distance_from_usual_location": 3.2,
            "foreign_transaction": 0,
            "transactions_last_hour": 1,
            "transactions_last_24_hours": 3,
            "failed_login_attempts": 0,
            "otp_verified": 1,
            "two_factor_auth": 1,
            "vpn_detected": 0,
            "proxy_detected": 0,
            "account_age": 36,
            "previous_fraud_cases": 0
        },
        {
            "transaction_id": "TXN1002",
            "customer_id": "CUST4102",
            "amount": 95000.0,
            "transaction_type": "Credit Card",
            "merchant_name": "Apex Crypto Exchange",
            "merchant_category": "Crypto/FX",
            "transaction_date": "2026-09-10",
            "transaction_time": "14:28:10",
            "device_type": "Desktop",
            "device_id": "DEV-WIN-990",
            "is_new_device": 1,
            "ip_address": "185.220.101.4",
            "country": "Russia",
            "state": "Moscow Region",
            "city": "Moscow",
            "distance_from_usual_location": 850.0,
            "foreign_transaction": 1,
            "transactions_last_hour": 8,
            "transactions_last_24_hours": 14,
            "failed_login_attempts": 4,
            "otp_verified": 0,
            "two_factor_auth": 0,
            "vpn_detected": 1,
            "proxy_detected": 1,
            "account_age": 4,
            "previous_fraud_cases": 1
        },
        {
            "transaction_id": "TXN1003",
            "customer_id": "CUST9012",
            "amount": 125000.0,
            "transaction_type": "Bank Transfer",
            "merchant_name": "Royal Gems & Jewelry",
            "merchant_category": "Jewelry",
            "transaction_date": "2026-09-10",
            "transaction_time": "13:05:40",
            "device_type": "Mobile",
            "device_id": "DEV-IOS-442",
            "is_new_device": 1,
            "ip_address": "45.14.174.12",
            "country": "United Arab Emirates",
            "state": "Dubai",
            "city": "Dubai",
            "distance_from_usual_location": 1200.0,
            "foreign_transaction": 1,
            "transactions_last_hour": 5,
            "transactions_last_24_hours": 9,
            "failed_login_attempts": 2,
            "otp_verified": 1,
            "two_factor_auth": 0,
            "vpn_detected": 1,
            "proxy_detected": 0,
            "account_age": 8,
            "previous_fraud_cases": 0
        },
        {
            "transaction_id": "TXN1004",
            "customer_id": "CUST3055",
            "amount": 4200.0,
            "transaction_type": "POS Payment",
            "merchant_name": "Starbucks Coffee",
            "merchant_category": "Dining",
            "transaction_date": "2026-09-10",
            "transaction_time": "12:40:15",
            "device_type": "POS",
            "device_id": "POS-TERM-102",
            "is_new_device": 0,
            "ip_address": "122.160.22.11",
            "country": "India",
            "state": "Maharashtra",
            "city": "Mumbai",
            "distance_from_usual_location": 1.5,
            "foreign_transaction": 0,
            "transactions_last_hour": 1,
            "transactions_last_24_hours": 2,
            "failed_login_attempts": 0,
            "otp_verified": 1,
            "two_factor_auth": 1,
            "vpn_detected": 0,
            "proxy_detected": 0,
            "account_age": 48,
            "previous_fraud_cases": 0
        },
        {
            "transaction_id": "TXN1005",
            "customer_id": "CUST7721",
            "amount": 48000.0,
            "transaction_type": "ATM Withdrawal",
            "merchant_name": "CityBank ATM #402",
            "merchant_category": "ATM Cash",
            "transaction_date": "2026-09-10",
            "transaction_time": "11:15:00",
            "device_type": "ATM",
            "device_id": "ATM-DEV-402",
            "is_new_device": 0,
            "ip_address": "115.240.10.5",
            "country": "India",
            "state": "Delhi",
            "city": "New Delhi",
            "distance_from_usual_location": 42.0,
            "foreign_transaction": 0,
            "transactions_last_hour": 3,
            "transactions_last_24_hours": 6,
            "failed_login_attempts": 1,
            "otp_verified": 1,
            "two_factor_auth": 1,
            "vpn_detected": 0,
            "proxy_detected": 0,
            "account_age": 18,
            "previous_fraud_cases": 0
        },
        {
            "transaction_id": "TXN1006",
            "customer_id": "CUST1190",
            "amount": 189000.0,
            "transaction_type": "Online Purchase",
            "merchant_name": "Luxury Watch Retailer",
            "merchant_category": "Electronics/Luxury",
            "transaction_date": "2026-09-09",
            "transaction_time": "23:45:10",
            "device_type": "Desktop",
            "device_id": "DEV-LINUX-09",
            "is_new_device": 1,
            "ip_address": "91.240.118.50",
            "country": "United Kingdom",
            "state": "London",
            "city": "London",
            "distance_from_usual_location": 2400.0,
            "foreign_transaction": 1,
            "transactions_last_hour": 6,
            "transactions_last_24_hours": 11,
            "failed_login_attempts": 3,
            "otp_verified": 0,
            "two_factor_auth": 0,
            "vpn_detected": 1,
            "proxy_detected": 1,
            "account_age": 2,
            "previous_fraud_cases": 2
        }
    ]

    for data in sample_raw_txns:
        ml_res = predict_transaction(data)
        txn_id = data["transaction_id"]
        cust_id = data["customer_id"]
        amt = data["amount"]
        tx_type = data["transaction_type"]
        merchant_name = data["merchant_name"]
        merchant_cat = data["merchant_category"]
        tx_date = data["transaction_date"]
        tx_time = data["transaction_time"]
        device_type = data["device_type"]
        device_id = data["device_id"]
        is_new_device = data["is_new_device"]
        ip_addr = data["ip_address"]
        country = data["country"]
        state = data["state"]
        city = data["city"]
        dist = data["distance_from_usual_location"]
        foreign = data["foreign_transaction"]
        txns_1h = data["transactions_last_hour"]
        txns_24h = data["transactions_last_24_hours"]
        failed_logins = data["failed_login_attempts"]
        otp_ver = data["otp_verified"]
        two_fa = data["two_factor_auth"]
        vpn = data["vpn_detected"]
        proxy = data["proxy_detected"]
        acc_age = data["account_age"]
        prev_fraud = data["previous_fraud_cases"]

        fraud_prob = ml_res['fraud_probability']
        risk_score = ml_res['risk_score']
        risk_level = ml_res['risk_level']
        prediction = ml_res['prediction']
        explanation_json = json.dumps(ml_res['explainability'])

        cursor.execute('''
            INSERT INTO transactions (
                transaction_id, customer_id, amount, transaction_type, merchant_name, merchant_category,
                transaction_date, transaction_time, device_type, device_id, is_new_device, ip_address,
                country, state, city, distance_from_usual_location, foreign_transaction,
                transactions_last_hour, transactions_last_24_hours, failed_login_attempts,
                otp_verified, two_factor_auth, vpn_detected, proxy_detected, account_age,
                previous_fraud_cases, fraud_probability, risk_score, risk_level, prediction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            txn_id, cust_id, amt, tx_type, merchant_name, merchant_cat,
            tx_date, tx_time, device_type, device_id, is_new_device, ip_addr,
            country, state, city, dist, foreign,
            txns_1h, txns_24h, failed_logins,
            otp_ver, two_fa, vpn, proxy, acc_age,
            prev_fraud, fraud_prob, risk_score, risk_level, prediction
        ))

        cursor.execute('''
            INSERT INTO predictions (transaction_id, prediction, fraud_probability, risk_score, model_version, explanation)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (txn_id, prediction, fraud_prob, risk_score, ml_res['model_version'], explanation_json))

        if risk_score >= 60:
            cursor.execute('''
                INSERT INTO fraud_alerts (transaction_id, alert_type, risk_score, reason, status)
                VALUES (?, ?, ?, ?, ?)
            ''', (txn_id, f"{risk_level} Risk Alert", risk_score, ml_res['explainability']['narrative_explanation'], 'New'))

    conn.commit()
    conn.close()
    print("Database seeded with sample users and transactions successfully.")

if __name__ == '__main__':
    seed_database()
