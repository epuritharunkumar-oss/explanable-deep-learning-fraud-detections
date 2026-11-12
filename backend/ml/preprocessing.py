import math

def extract_features(data):
    """
    Extracts and normalizes multi-modal financial transaction features.
    Accepts dictionary of raw input data and produces a structured feature dictionary.
    """
    amount = float(data.get('amount', 0))
    avg_amount = float(data.get('average_amount', 3000)) if data.get('average_amount') else 3000.0
    amount_ratio = amount / max(avg_amount, 1.0)
    
    distance_val = data.get('distance_from_usual_location')
    if distance_val is None or distance_val == '':
        distance_val = data.get('location_distance')
    if distance_val is None or distance_val == '':
        distance_val = data.get('distance', 0)
    distance = float(distance_val or 0)

    txns_1h = int(data.get('transactions_last_hour', 0))
    txns_24h = int(data.get('transactions_last_24_hours', 1))
    failed_logins = int(data.get('failed_login_attempts', 0))
    account_age = int(data.get('account_age', 12))
    prev_fraud = int(data.get('previous_fraud_cases', 0))

    is_new_device = 1 if str(data.get('is_new_device')).lower() in ['true', '1', 'yes'] else 0
    foreign_txn = 1 if str(data.get('foreign_transaction')).lower() in ['true', '1', 'yes'] else 0
    vpn_detected = 1 if str(data.get('vpn_detected')).lower() in ['true', '1', 'yes'] else 0
    proxy_detected = 1 if str(data.get('proxy_detected')).lower() in ['true', '1', 'yes'] else 0

    otp_raw = data.get('otp_verified')
    otp_verified = 1 if otp_raw is None or str(otp_raw).strip() == '' or str(otp_raw).lower() in ['true', '1', 'yes'] else 0

    two_factor_raw = data.get('two_factor_auth')
    two_factor = 1 if two_factor_raw is None or str(two_factor_raw).strip() == '' or str(two_factor_raw).lower() in ['true', '1', 'yes'] else 0

    tx_type = str(data.get('transaction_type', 'Credit Card')).upper()
    merchant_cat = str(data.get('merchant_category', 'General')).lower()
    device_type = str(data.get('device_type', 'Mobile')).lower()

    # Category risk weights
    high_risk_merchants = ['jewelry', 'crypto', 'electronics', 'wire transfer', 'gambling', 'luxury']
    merchant_risk = 1.8 if any(m in merchant_cat for m in high_risk_merchants) else 1.0

    return {
        'amount': amount,
        'amount_ratio': amount_ratio,
        'distance': distance,
        'txns_1h': txns_1h,
        'txns_24h': txns_24h,
        'failed_logins': failed_logins,
        'account_age': account_age,
        'prev_fraud': prev_fraud,
        'is_new_device': is_new_device,
        'foreign_txn': foreign_txn,
        'vpn_detected': vpn_detected,
        'proxy_detected': proxy_detected,
        'otp_verified': otp_verified,
        'two_factor': two_factor,
        'tx_type': tx_type,
        'merchant_risk': merchant_risk,
        'device_type': device_type
    }
