import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import csv
import json
import pickle
import numpy as np
from datetime import datetime
from ml.classifier import RandomForestClassifier, evaluate_model

DATASET_PATH = os.path.join(os.path.dirname(__file__), '../data/fraud_dataset.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models_saved')

FEATURE_NAMES = [
    'amount',
    'distance_from_usual_location',
    'transactions_last_hour',
    'transactions_last_24_hours',
    'failed_login_attempts',
    'account_age',
    'is_new_device',
    'foreign_transaction',
    'vpn_detected',
    'proxy_detected',
    'otp_verified',
    'two_factor_auth',
    'previous_fraud_cases',
    'is_high_risk_merchant',
    'is_upi',
    'is_credit_card',
    'is_wire_transfer'
]

def extract_vector_from_row(row):
    amount = float(row.get('amount') or 0)
    
    dist_val = row.get('distance_from_usual_location') or row.get('location_distance') or row.get('distance') or 0
    distance = float(dist_val)
    
    txns_1h = int(row.get('transactions_last_hour') or 0)
    txns_24h = int(row.get('transactions_last_24_hours') or 1)
    failed_logins = int(row.get('failed_login_attempts') or 0)
    account_age = int(row.get('account_age') or 12)
    
    is_new_device = 1 if str(row.get('is_new_device')).lower() in ['1', 'true', 'yes'] else 0
    foreign_tx = 1 if str(row.get('foreign_transaction')).lower() in ['1', 'true', 'yes'] else 0
    vpn = 1 if str(row.get('vpn_detected')).lower() in ['1', 'true', 'yes'] else 0
    proxy = 1 if str(row.get('proxy_detected')).lower() in ['1', 'true', 'yes'] else 0
    
    otp_raw = row.get('otp_verified')
    otp_v = 1 if otp_raw is None or str(otp_raw).strip() == '' or str(otp_raw).lower() in ['1', 'true', 'yes'] else 0

    two_factor_raw = row.get('two_factor_auth')
    two_f = 1 if two_factor_raw is None or str(two_factor_raw).strip() == '' or str(two_factor_raw).lower() in ['1', 'true', 'yes'] else 0

    prev_fraud = int(row.get('previous_fraud_cases') or 0)

    merchant_cat = str(row.get('merchant_category', '')).lower()
    high_risk_cats = ['jewelry', 'crypto', 'crypto/fx', 'electronics', 'wire transfer', 'gambling', 'luxury']
    is_high_risk_merchant = 1 if any(c in merchant_cat for c in high_risk_cats) else 0

    tx_type = str(row.get('transaction_type', '')).upper()
    is_upi = 1 if 'UPI' in tx_type else 0
    is_credit = 1 if 'CREDIT' in tx_type else 0
    is_wire = 1 if 'BANK' in tx_type or 'WIRE' in tx_type else 0

    return [
        amount, distance, txns_1h, txns_24h, failed_logins, account_age,
        is_new_device, foreign_tx, vpn, proxy, otp_v, two_f,
        prev_fraud, is_high_risk_merchant, is_upi, is_credit, is_wire
    ]

def train_and_save_model(dataset_path=None):
    if dataset_path is None:
        dataset_path = DATASET_PATH

    if not os.path.exists(dataset_path):
        from data.generate_dataset import generate_fraud_dataset
        generate_fraud_dataset(dataset_path, 5000)

    print(f"Loading dataset from: {dataset_path}")
    X_list = []
    y_list = []

    with open(dataset_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vec = extract_vector_from_row(row)
            label = int(row.get('is_fraud', 0))
            X_list.append(vec)
            y_list.append(label)

    X = np.array(X_list, dtype=np.float64)
    y = np.array(y_list, dtype=np.int32)

    total_records = len(y)
    fraud_records = int(np.sum(y == 1))
    legit_records = int(np.sum(y == 0))
    print(f"Loaded {total_records} records ({legit_records} Legit, {fraud_records} Fraud)")

    # 80/20 Train/Test Split
    np.random.seed(42)
    indices = np.arange(total_records)
    np.random.shuffle(indices)

    split_idx = int(total_records * 0.8)
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]

    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    # Train Random Forest Classifier on dataset
    print("Fitting Random Forest Classifier on dataset...")
    rf = RandomForestClassifier(n_estimators=30, max_depth=9, min_samples_split=4, random_state=42)
    rf.fit(X_train, y_train)

    # Evaluate on holdout test set
    y_test_probs = rf.predict_proba(X_test)[:, 1]
    eval_results = evaluate_model(y_test, y_test_probs, threshold=0.5)

    # Calculate real feature importances from model trees
    feat_importances = []
    for name, imp in zip(FEATURE_NAMES, rf.feature_importances_):
        feat_importances.append({
            'feature': name.replace('_', ' ').title(),
            'importance': round(float(imp), 4)
        })
    feat_importances.sort(key=lambda x: x['importance'], reverse=True)

    # Save artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_file = os.path.join(MODEL_DIR, 'fraud_model.pkl')
    with open(model_file, 'wb') as f:
        pickle.dump(rf, f)
    print(f"Saved trained model to: {model_file}")

    meta_file = os.path.join(MODEL_DIR, 'feature_meta.json')
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump({
            'feature_names': FEATURE_NAMES,
            'num_features': len(FEATURE_NAMES),
            'dataset_size': total_records,
            'trained_at': datetime.utcnow().isoformat() + 'Z'
        }, f, indent=2)

    metrics_payload = {
        'status': 'Model Successfully Trained on Dataset',
        'trained_at': datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        'algorithm': 'Random Forest Classifier (Ensemble Trees)',
        'dataset_name': 'Multi-Modal Financial Fraud Dataset (5,000 Transactions)',
        'dataset_samples': total_records,
        'metrics': {
            'accuracy': eval_results['accuracy'],
            'precision': eval_results['precision'],
            'recall': eval_results['recall'],
            'f1_score': eval_results['f1_score'],
            'roc_auc': eval_results['roc_auc']
        },
        'confusion_matrix': eval_results['confusion_matrix'],
        'roc_curve': eval_results['roc_curve'],
        'feature_importance': feat_importances
    }

    metrics_file = os.path.join(MODEL_DIR, 'metrics.json')
    with open(metrics_file, 'w', encoding='utf-8') as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"Saved model metrics to: {metrics_file}")
    print(f"Training Results -> Accuracy: {eval_results['accuracy']*100:.2f}%, F1: {eval_results['f1_score']*100:.2f}%, Recall: {eval_results['recall']*100:.2f}%")

    return metrics_payload

if __name__ == '__main__':
    train_and_save_model()
