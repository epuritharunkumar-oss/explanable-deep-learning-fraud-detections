import os
import pickle
import json

MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models_saved')
MODEL_PKL = os.path.join(MODEL_DIR, 'fraud_model.pkl')
METRICS_FILE = os.path.join(MODEL_DIR, 'metrics.json')

_loaded_model = None
_loaded_metrics = None

def load_fraud_model(force_reload=False):
    """
    Loads the trained Random Forest / Machine Learning model from disk.
    Caches the model in memory; supports force_reload after retraining.
    """
    global _loaded_model
    if _loaded_model is not None and not force_reload:
        return _loaded_model

    if os.path.exists(MODEL_PKL):
        try:
            with open(MODEL_PKL, 'rb') as f:
                _loaded_model = pickle.load(f)
            print(f"Successfully loaded trained ML model from: {MODEL_PKL}")
            return _loaded_model
        except Exception as e:
            print(f"Error loading {MODEL_PKL}: {e}")

    return None

def load_model_metrics(force_reload=False):
    """
    Loads the evaluated metrics and feature importances computed directly from the dataset.
    """
    global _loaded_metrics
    if _loaded_metrics is not None and not force_reload:
        return _loaded_metrics

    if os.path.exists(METRICS_FILE):
        try:
            with open(METRICS_FILE, 'r', encoding='utf-8') as f:
                _loaded_metrics = json.load(f)
            return _loaded_metrics
        except Exception as e:
            print(f"Error reading metrics: {e}")

    return None
