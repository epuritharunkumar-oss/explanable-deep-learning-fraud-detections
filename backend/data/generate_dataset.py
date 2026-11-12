import csv
import random
import os

def generate_fraud_dataset(filepath, num_samples=5000):
    random.seed(42)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    headers = [
        'transaction_id', 'customer_id', 'amount', 'transaction_type',
        'merchant_category', 'device_type', 'is_new_device',
        'distance_from_usual_location', 'transactions_last_hour',
        'transactions_last_24_hours', 'failed_login_attempts', 'account_age',
        'foreign_transaction', 'vpn_detected', 'proxy_detected',
        'otp_verified', 'two_factor_auth', 'previous_fraud_cases', 'is_fraud'
    ]

    transaction_types = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'ATM Withdrawal', 'POS Payment']
    merchant_categories = ['Groceries', 'Dining', 'Electronics', 'Jewelry', 'Crypto/FX', 'Travel', 'Cash', 'General']
    device_types = ['Mobile', 'Desktop', 'Tablet', 'POS', 'ATM']

    records = []
    
    # Target ~15% fraud rate in the dataset
    for i in range(1, num_samples + 1):
        txn_id = f"TXN{10000 + i}"
        cust_id = f"CUST{random.randint(1000, 9999)}"
        
        # Decide if this record should be a fraud case (15% base probability)
        is_fraud = 1 if random.random() < 0.15 else 0

        if is_fraud:
            # Fraudulent transaction characteristics
            amount = round(random.choice([
                random.uniform(35000, 180000),
                random.uniform(50000, 300000),
                random.uniform(20000, 95000)
            ]), 2)
            tx_type = random.choices(
                transaction_types,
                weights=[0.15, 0.40, 0.10, 0.25, 0.05, 0.05]
            )[0]
            merchant_cat = random.choices(
                merchant_categories,
                weights=[0.05, 0.05, 0.30, 0.25, 0.25, 0.08, 0.01, 0.01]
            )[0]
            device_type = random.choices(device_types, weights=[0.45, 0.40, 0.10, 0.03, 0.02])[0]
            is_new_device = 1 if random.random() < 0.78 else 0
            distance = round(random.choice([
                random.uniform(350, 2500),
                random.uniform(80, 600)
            ]), 1)
            txns_1h = random.choices([1, 2, 3, 4, 5, 7, 9], weights=[0.1, 0.15, 0.25, 0.2, 0.15, 0.1, 0.05])[0]
            txns_24h = txns_1h + random.randint(2, 15)
            failed_logins = random.choices([0, 1, 2, 3, 4, 5], weights=[0.2, 0.25, 0.25, 0.15, 0.1, 0.05])[0]
            account_age = random.choices([1, 2, 3, 6, 12, 24], weights=[0.3, 0.25, 0.2, 0.15, 0.07, 0.03])[0]
            foreign_tx = 1 if random.random() < 0.55 else 0
            vpn_detected = 1 if random.random() < 0.62 else 0
            proxy_detected = 1 if random.random() < 0.45 else 0
            otp_verified = 0 if random.random() < 0.58 else 1
            two_factor = 0 if random.random() < 0.65 else 1
            prev_fraud = random.choices([0, 1, 2], weights=[0.75, 0.2, 0.05])[0]
        else:
            # Legitimate transaction characteristics
            amount = round(random.choice([
                random.uniform(100, 5000),
                random.uniform(500, 15000),
                random.uniform(2000, 32000)
            ]), 2)
            tx_type = random.choices(
                transaction_types,
                weights=[0.40, 0.25, 0.15, 0.10, 0.05, 0.05]
            )[0]
            merchant_cat = random.choices(
                merchant_categories,
                weights=[0.35, 0.25, 0.10, 0.03, 0.01, 0.10, 0.08, 0.08]
            )[0]
            device_type = random.choices(device_types, weights=[0.60, 0.20, 0.10, 0.05, 0.05])[0]
            is_new_device = 1 if random.random() < 0.08 else 0
            distance = round(random.choice([
                random.uniform(0.1, 15.0),
                random.uniform(5.0, 45.0)
            ]), 1)
            txns_1h = random.choices([0, 1, 2], weights=[0.65, 0.28, 0.07])[0]
            txns_24h = txns_1h + random.randint(0, 5)
            failed_logins = random.choices([0, 1], weights=[0.94, 0.06])[0]
            account_age = random.randint(6, 60)
            foreign_tx = 1 if random.random() < 0.04 else 0
            vpn_detected = 1 if random.random() < 0.05 else 0
            proxy_detected = 1 if random.random() < 0.02 else 0
            otp_verified = 1 if random.random() < 0.96 else 0
            two_factor = 1 if random.random() < 0.94 else 0
        # Introduce ~4% realistic borderline transactions (e.g. legitimate travel/high-value purchases, micro-fraud probing)
        is_borderline = random.random() < 0.04
        if is_borderline and not is_fraud:
            # Legitimate user traveling or buying high-value items
            amount = round(random.uniform(45000, 110000), 2)
            merchant_cat = random.choice(['Jewelry', 'Electronics', 'Travel'])
            distance = round(random.uniform(150, 750), 1)
            is_new_device = 1 if random.random() < 0.45 else 0
            failed_logins = 1 if random.random() < 0.3 else 0
        elif is_borderline and is_fraud:
            # Stealthy micro-fraud testing stolen card
            amount = round(random.uniform(850, 4500), 2)
            merchant_cat = random.choice(['Groceries', 'General', 'Dining'])
            distance = round(random.uniform(5, 35), 1)
            failed_logins = 0
            is_new_device = 0

        records.append([
            txn_id, cust_id, amount, tx_type, merchant_cat, device_type,
            is_new_device, distance, txns_1h, txns_24h, failed_logins,
            account_age, foreign_tx, vpn_detected, proxy_detected,
            otp_verified, two_factor, prev_fraud, is_fraud
        ])

    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(records)

    print(f"Generated dataset with {len(records)} records saved to: {filepath}")
    fraud_count = sum(1 for r in records if r[-1] == 1)
    print(f"Distribution: {len(records) - fraud_count} Legitimate, {fraud_count} Fraudulent ({fraud_count/len(records)*100:.1f}%)")

if __name__ == '__main__':
    dest = os.path.join(os.path.dirname(__file__), 'fraud_dataset.csv')
    generate_fraud_dataset(dest, 5000)
