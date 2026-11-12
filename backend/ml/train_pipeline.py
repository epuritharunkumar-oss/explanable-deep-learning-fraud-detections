import os
import json
import pickle
import datetime
import numpy as np
from ml.deep_model import TabularDeepNeuralNet, DataPreprocessor, ModelEvaluator, DeepExplainability

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models_saved')

def get_saved_model():
    model_path = os.path.join(MODEL_DIR, 'deep_fraud_model.pkl')
    preproc_path = os.path.join(MODEL_DIR, 'deep_preprocessor.pkl')
    if os.path.exists(model_path) and os.path.exists(preproc_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(preproc_path, 'rb') as f:
            preprocessor = pickle.load(f)
        return model, preprocessor
    return None, None

def run_training_pipeline(rows, dataset_name="Financial Fraud Dataset", test_size=0.2, epochs=25, random_state=42):
    if not rows or len(rows) < 10:
        raise ValueError("Dataset is too small or empty. Please provide at least 10 rows for training.")

    preprocessor = DataPreprocessor()
    info = preprocessor.inspect_dataset(rows)
    if not info['valid']:
        raise ValueError("Training cannot start because the dataset does not contain a valid fraud target column.")

    target_col = info['target_column']
    total_records = len(rows)

    # 1. Fit preprocessor and extract X, y
    preprocessor.fit(rows)
    X, y = preprocessor.transform(rows, include_target=True)

    # 2. Reproducible 80/20 train/test split
    np.random.seed(random_state)
    indices = np.arange(total_records)
    np.random.shuffle(indices)

    split_idx = int(total_records * (1.0 - test_size))
    train_idx = indices[:split_idx]
    test_idx = indices[split_idx:]

    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    # 3. Train Deep Neural Network on training portion ONLY
    input_dim = X_train.shape[1]
    model = TabularDeepNeuralNet(
        input_dim=input_dim,
        hidden_dims=[64, 32, 16],
        lr=0.003,
        weight_decay=1e-4,
        random_state=random_state
    )

    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=64,
        validation_data=(X_test, y_test)
    )

    # 4. Evaluate ONLY on holdout test set
    y_test_probs = model.predict_proba(X_test)[:, 1]
    eval_metrics = ModelEvaluator.evaluate(y_test, y_test_probs, threshold=0.5)

    # 5. Save trained model, preprocessor, and metadata
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, 'deep_fraud_model.pkl')
    preproc_path = os.path.join(MODEL_DIR, 'deep_preprocessor.pkl')
    metrics_path = os.path.join(MODEL_DIR, 'deep_metrics.json')

    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    with open(preproc_path, 'wb') as f:
        pickle.dump(preprocessor, f)

    trained_time_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    meta_payload = {
        'status': 'Model trained successfully',
        'dataset_name': dataset_name,
        'model_name': 'Multi-Modal Tabular Deep Neural Network',
        'model_version': 'DeepNet-v2.1',
        'trained_at': trained_time_str,
        'architecture': 'Input(D) -> Dense(64, LeakyReLU) -> Dense(32, LeakyReLU) -> Dense(16, LeakyReLU) -> Dense(1, Sigmoid)',
        'optimizer': 'Adam (lr=0.003, beta1=0.9, beta2=0.999)',
        'loss_function': 'Class-Weighted Binary Cross-Entropy',
        'total_records': total_records,
        'training_records': len(train_idx),
        'testing_records': len(test_idx),
        'target_column': target_col,
        'features_used': preprocessor.feature_names,
        'feature_count': len(preprocessor.feature_names),
        'metrics': {
            'accuracy': eval_metrics['accuracy'],
            'precision': eval_metrics['precision'],
            'recall': eval_metrics['recall'],
            'f1_score': eval_metrics['f1_score'],
            'roc_auc': eval_metrics['roc_auc']
        },
        'confusion_matrix': eval_metrics['confusion_matrix'],
        'roc_curve': eval_metrics['roc_curve'],
        'history': history
    }

    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(meta_payload, f, indent=2)

    return meta_payload

def generate_batch_predictions(rows, use_test_only=False, test_size=0.2, random_state=42):
    model, preprocessor = get_saved_model()
    if model is None or preprocessor is None:
        raise ValueError("No trained deep learning model found. Please train the AI model first.")

    target_col = preprocessor.target_col
    total_records = len(rows)

    if use_test_only:
        np.random.seed(random_state)
        indices = np.arange(total_records)
        np.random.shuffle(indices)
        split_idx = int(total_records * (1.0 - test_size))
        selected_indices = indices[split_idx:]
        selected_rows = [rows[i] for i in selected_indices]
    else:
        selected_rows = rows

    X = preprocessor.transform(selected_rows, include_target=False)
    probs = model.predict_proba(X)[:, 1]

    predictions = []
    fraud_count = 0
    legit_count = 0
    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0

    for idx, (r, prob) in enumerate(zip(selected_rows, probs)):
        prob_val = float(prob)
        risk_score = int(round(prob_val * 100))

        # Risk Classification & Decision Recommendation
        if risk_score >= 81:
            risk_level = 'Critical'
            action = 'BLOCK TRANSACTION'
            critical_count += 1
            predicted_label = 'Fraudulent'
            fraud_count += 1
        elif risk_score >= 61:
            risk_level = 'High'
            action = 'MANUAL REVIEW / FLAG'
            high_count += 1
            predicted_label = 'Fraudulent'
            fraud_count += 1
        elif risk_score >= 31:
            risk_level = 'Medium'
            action = 'ADDITIONAL VERIFICATION'
            medium_count += 1
            predicted_label = 'Legitimate'
            legit_count += 1
        else:
            risk_level = 'Low'
            action = 'ALLOW TRANSACTION'
            low_count += 1
            predicted_label = 'Legitimate'
            legit_count += 1

        # Actual label from CSV (if available)
        raw_actual = r.get(target_col) if target_col else r.get('is_fraud', r.get('fraud'))
        if raw_actual is not None and str(raw_actual).strip() != '':
            str_actual = str(raw_actual).strip().lower()
            if str_actual in ['1', 'true', 'yes', 'fraud', 'fraudulent']:
                actual_label = 'Fraudulent'
                actual_num = 1
            else:
                actual_label = 'Legitimate'
                actual_num = 0
        else:
            actual_label = 'Unknown'
            actual_num = None

        txn_id = r.get('transaction_id') or r.get('txn_id') or f"TXN-{10000+idx}"
        cust_id = r.get('customer_id') or r.get('cust_id') or f"CUST-{5000+idx}"
        amount = r.get('amount', '0')

        # Explainability for top/suspicious items
        explanation = None
        if risk_score >= 50 or idx < 10:
            explanation = DeepExplainability.explain_sample(model, preprocessor, r, sample_vec=X[idx])

        predictions.append({
            'transaction_id': txn_id,
            'customer_id': cust_id,
            'amount': amount,
            'transaction_type': r.get('transaction_type', 'UPI'),
            'merchant_category': r.get('merchant_category', 'General'),
            'device_type': r.get('device_type', 'Mobile'),
            'is_new_device': r.get('is_new_device', 'No'),
            'location_distance': r.get('distance_from_usual_location', r.get('location_distance', '0')),
            'transactions_last_hour': r.get('transactions_last_hour', '0'),
            'failed_login_attempts': r.get('failed_login_attempts', '0'),
            'account_age': r.get('account_age', '12'),
            'foreign_transaction': r.get('foreign_transaction', 'No'),
            'actual_fraud_label': actual_label,
            'actual_num': actual_num,
            'ai_predicted_label': predicted_label,
            'fraud_probability': f"{round(prob_val * 100, 1)}%",
            'fraud_probability_raw': round(prob_val, 4),
            'risk_score': risk_score,
            'risk_level': risk_level,
            'recommended_action': action,
            'explanation': explanation
        })

    total_predicted = len(predictions)
    summary = {
        'total_transactions': total_predicted,
        'predicted_fraudulent': fraud_count,
        'predicted_legitimate': legit_count,
        'critical_risk_count': critical_count,
        'high_risk_count': high_count,
        'medium_risk_count': medium_count,
        'low_risk_count': low_count,
        'fraud_percentage': f"{round((fraud_count / max(total_predicted, 1)) * 100, 1)}%"
    }

    return {
        'summary': summary,
        'predictions': predictions
    }
