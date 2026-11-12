import numpy as np
from ml.train_model import extract_vector_from_row
from ml.model_loader import load_fraud_model
from ml.explainability import generate_explainability
from ml.preprocessing import extract_features

from ml.train_pipeline import get_saved_model

class FraudPredictor:
    def __init__(self):
        self.deep_model, self.deep_preprocessor = get_saved_model()
        self.rf_model = load_fraud_model()

    def reload_model(self):
        self.deep_model, self.deep_preprocessor = get_saved_model()
        self.rf_model = load_fraud_model(force_reload=True)

    def predict(self, raw_data):
        if self.deep_model is None and self.rf_model is None:
            self.reload_model()

        features = extract_features(raw_data)
        
        # Priority 1: Deep Neural Network
        if self.deep_model is not None and self.deep_preprocessor is not None:
            try:
                vec = self.deep_preprocessor.transform([raw_data], include_target=False)
                probs = self.deep_model.predict_proba(vec)[0]
                fraud_prob = float(probs[1])
                # Actual model confidence = how certain the model is in its chosen class
                raw_confidence = float(max(probs))
                model_ver = "DeepNeuralNet-v2.1"
            except Exception as e:
                print("Deep model predict fallback:", e)
                vec = extract_vector_from_row(raw_data)
                probs = self.rf_model.predict_proba([vec])[0] if self.rf_model else [0.95, 0.05]
                fraud_prob = float(probs[1])
                raw_confidence = float(max(probs))
                model_ver = "RandomForest-Trained-v1.0"
        elif self.rf_model is not None:
            vec = extract_vector_from_row(raw_data)
            probs = self.rf_model.predict_proba([vec])[0]
            fraud_prob = float(probs[1])
            # Actual model confidence = how certain the model is in its chosen class
            raw_confidence = float(max(probs))
            model_ver = "RandomForest-Trained-v1.0"
        else:
            fraud_prob = 0.05
            raw_confidence = 0.95
            model_ver = "Heuristic-Baseline"

        fraud_prob = round(max(0.01, min(0.999, fraud_prob)), 3)
        risk_score = int(round(fraud_prob * 100))

        # Risk Classification & Decision Support
        if risk_score >= 80:
            risk_level = "Critical"
            prediction = "Fraudulent"
            recommendation = "BLOCK TRANSACTION"
            action_code = "BLOCK"
        elif risk_score >= 60:
            risk_level = "High"
            prediction = "Fraudulent"
            recommendation = "MANUAL REVIEW REQUIRED"
            action_code = "FLAG"
        elif risk_score >= 30:
            risk_level = "Medium"
            prediction = "Legitimate"
            recommendation = "REQUIRE ADDITIONAL VERIFICATION"
            action_code = "VERIFY"
        else:
            risk_level = "Low"
            prediction = "Legitimate"
            recommendation = "ALLOW TRANSACTION"
            action_code = "ALLOW"

        # Model confidence = actual model certainty in its chosen class (from predict_proba)
        # This is distinct from risk_score which measures fraud probability on a 0-100 scale
        confidence_score = round(raw_confidence * 100, 1)
        explainability = generate_explainability(raw_data, features, fraud_prob, risk_score)

        return {
            "prediction": prediction,
            "fraud_probability": fraud_prob,
            "fraud_percentage": f"{round(fraud_prob * 100, 1)}%",
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "action_code": action_code,
            "confidence_score": f"{confidence_score}%",
            "model_version": model_ver,
            "explainability": explainability
        }

predictor_instance = FraudPredictor()

def predict_transaction(raw_data):
    return predictor_instance.predict(raw_data)

def reload_predictor():
    predictor_instance.reload_model()
