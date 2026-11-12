from flask import Blueprint, jsonify, request
from ml.model_loader import load_model_metrics
from ml.train_model import train_and_save_model
from ml.fraud_predictor import reload_predictor

model_bp = Blueprint('model', __name__)

@model_bp.route('/model/info', methods=['GET'])
def get_model_info():
    metrics_data = load_model_metrics()
    dataset_samples = metrics_data.get('dataset_samples', 5000) if metrics_data else 5000
    trained_at = metrics_data.get('trained_at', '2026-09-12') if metrics_data else 'Recent'

    return jsonify({
        'model_name': 'Multi-Modal Supervised Random Forest Fraud Classifier',
        'version': 'v3.0-TrainedDataset',
        'framework': 'Supervised Ensemble Trees (NumPy Engine)',
        'dataset': f'Multi-Modal Financial Fraud Dataset ({dataset_samples:,} records)',
        'trained_at': trained_at,
        'architecture': {
            'input_layers': [
                {'modality': 'Transaction Data', 'features': ['Amount', 'Payment Method (UPI/Card/Transfer)', 'Merchant Risk', 'Velocity']},
                {'modality': 'Customer Behaviour', 'features': ['Account Age', '1h Velocity', '24h Velocity', 'Previous Fraud History']},
                {'modality': 'Device Features', 'features': ['New Device Flag', 'IP Address', 'Device Type']},
                {'modality': 'Location Features', 'features': ['Distance from Usual Location', 'Cross-border Foreign Flag']},
                {'modality': 'Security Parameters', 'features': ['Failed Login Count', 'OTP Status', '2FA Status', 'VPN Detection', 'Proxy Detection']}
            ],
            'ensemble_configuration': {
                'algorithm': 'Random Forest Classifier',
                'trees_count': 30,
                'max_depth': 9,
                'criterion': 'Gini Impurity Reduction',
                'feature_sampling': 'sqrt'
            },
            'output': 'Calibrated Fraud Probability (0.00 - 1.00) & Multi-Tier Risk Classification',
            'explainability_layer': 'Dynamic Tree Split Impurity Feature Attribution'
        }
    }), 200

@model_bp.route('/model/metrics', methods=['GET'])
def get_model_metrics():
    metrics_data = load_model_metrics()
    if not metrics_data:
        # Fallback train if not yet generated
        metrics_data = train_and_save_model()

    return jsonify(metrics_data), 200

@model_bp.route('/model/train', methods=['POST'])
def trigger_training():
    try:
        new_metrics = train_and_save_model()
        reload_predictor()
        return jsonify({
            'success': True,
            'message': 'Model successfully trained on dataset and reloaded into inference engine!',
            'metrics': new_metrics
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
