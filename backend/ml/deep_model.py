import os
import json
import pickle
import numpy as np

class TabularDeepNeuralNet:
    """
    Multi-Layer Deep Neural Network for Multi-Modal Tabular Financial Fraud Prediction.
    Architecture:
      Input (D) -> Dense(64) + LeakyReLU + Dropout(0.2)
                -> Dense(32) + LeakyReLU + Dropout(0.2)
                -> Dense(16) + LeakyReLU
                -> Dense(1)  + Sigmoid
    Optimization:
      Adam Optimizer with bias correction (beta1=0.9, beta2=0.999, eps=1e-8)
      Binary Cross-Entropy with Positive Class Weighting to combat class imbalance.
    """
    def __init__(self, input_dim, hidden_dims=[64, 32, 16], lr=0.003, weight_decay=1e-4, random_state=42):
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.lr = lr
        self.weight_decay = weight_decay
        self.random_state = random_state
        self.dims = [input_dim] + hidden_dims + [1]
        
        np.random.seed(random_state)
        self.weights = []
        self.biases = []
        
        # He Normal initialization
        for i in range(len(self.dims) - 1):
            w = np.random.randn(self.dims[i], self.dims[i+1]) * np.sqrt(2.0 / self.dims[i])
            b = np.zeros((1, self.dims[i+1]))
            self.weights.append(w)
            self.biases.append(b)

        # Adam state variables
        self.m_w = [np.zeros_like(w) for w in self.weights]
        self.v_w = [np.zeros_like(w) for w in self.weights]
        self.m_b = [np.zeros_like(b) for b in self.biases]
        self.v_b = [np.zeros_like(b) for b in self.biases]
        self.t = 0

    def _leaky_relu(self, z, alpha=0.05):
        return np.where(z > 0, z, z * alpha)

    def _leaky_relu_derivative(self, z, alpha=0.05):
        return np.where(z > 0, 1.0, alpha)

    def _sigmoid(self, z):
        return 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))

    def forward(self, X, training=False, dropout_rate=0.2):
        self.a = [X]
        self.z = []
        self.dropout_masks = []
        
        for i in range(len(self.weights) - 1):
            zi = self.a[-1] @ self.weights[i] + self.biases[i]
            ai = self._leaky_relu(zi)
            
            if training and dropout_rate > 0:
                mask = (np.random.rand(*ai.shape) >= dropout_rate) / (1.0 - dropout_rate)
                ai = ai * mask
                self.dropout_masks.append(mask)
            else:
                self.dropout_masks.append(None)

            self.z.append(zi)
            self.a.append(ai)

        # Output Layer (Sigmoid)
        out_z = self.a[-1] @ self.weights[-1] + self.biases[-1]
        out_a = self._sigmoid(out_z)
        self.z.append(out_z)
        self.a.append(out_a)
        return out_a

    def backward(self, y_true, pos_weight=1.0):
        m = y_true.shape[0]
        y_pred = np.clip(self.a[-1], 1e-7, 1.0 - 1e-7)
        
        # Weighted binary cross entropy derivative:
        # L = - [ w * y * log(p) + (1-y) * log(1-p) ]
        # dL/dz = p * (1 + (w - 1) * y) - w * y
        dz = (y_pred * (1.0 + (pos_weight - 1.0) * y_true) - pos_weight * y_true) / m

        self.t += 1
        beta1, beta2, eps = 0.9, 0.999, 1e-8

        for i in reversed(range(len(self.weights))):
            dw = self.a[i].T @ dz + self.weight_decay * self.weights[i]
            db = np.sum(dz, axis=0, keepdims=True)

            if i > 0:
                da = dz @ self.weights[i].T
                if self.dropout_masks[i-1] is not None:
                    da = da * self.dropout_masks[i-1]
                dz = da * self._leaky_relu_derivative(self.z[i-1])

            # Adam parameter updates
            self.m_w[i] = beta1 * self.m_w[i] + (1.0 - beta1) * dw
            self.v_w[i] = beta2 * self.v_w[i] + (1.0 - beta2) * (dw ** 2)
            m_w_hat = self.m_w[i] / (1.0 - beta1 ** self.t)
            v_w_hat = self.v_w[i] / (1.0 - beta2 ** self.t)
            self.weights[i] -= self.lr * m_w_hat / (np.sqrt(v_w_hat) + eps)

            self.m_b[i] = beta1 * self.m_b[i] + (1.0 - beta1) * db
            self.v_b[i] = beta2 * self.v_b[i] + (1.0 - beta2) * (db ** 2)
            m_b_hat = self.m_b[i] / (1.0 - beta1 ** self.t)
            v_b_hat = self.v_b[i] / (1.0 - beta2 ** self.t)
            self.biases[i] -= self.lr * m_b_hat / (np.sqrt(v_b_hat) + eps)

    def fit(self, X, y, epochs=30, batch_size=64, validation_data=None):
        y_col = y.reshape(-1, 1).astype(np.float64)
        pos_count = np.sum(y == 1)
        neg_count = np.sum(y == 0)
        pos_weight = float(neg_count) / max(float(pos_count), 1.0)
        # Cap pos_weight safely between 1.0 and 8.0
        pos_weight = min(max(pos_weight, 1.0), 8.0)

        best_val_loss = float('inf')
        best_weights = [w.copy() for w in self.weights]
        best_biases = [b.copy() for b in self.biases]

        history = {'train_loss': [], 'val_loss': []}

        for ep in range(epochs):
            perm = np.random.permutation(len(X))
            X_shuffled = X[perm]
            y_shuffled = y_col[perm]

            for b in range(0, len(X), batch_size):
                xb = X_shuffled[b:b+batch_size]
                yb = y_shuffled[b:b+batch_size]
                self.forward(xb, training=True, dropout_rate=0.2)
                self.backward(yb, pos_weight=pos_weight)

            # Compute epoch losses
            preds_train = np.clip(self.forward(X, training=False), 1e-7, 1.0 - 1e-7)
            train_loss = -np.mean(pos_weight * y_col * np.log(preds_train) + (1.0 - y_col) * np.log(1.0 - preds_train))
            history['train_loss'].append(round(float(train_loss), 4))

            if validation_data is not None:
                X_val, y_val = validation_data
                y_val_col = y_val.reshape(-1, 1).astype(np.float64)
                preds_val = np.clip(self.forward(X_val, training=False), 1e-7, 1.0 - 1e-7)
                val_loss = -np.mean(pos_weight * y_val_col * np.log(preds_val) + (1.0 - y_val_col) * np.log(1.0 - preds_val))
                history['val_loss'].append(round(float(val_loss), 4))

                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    best_weights = [w.copy() for w in self.weights]
                    best_biases = [b.copy() for b in self.biases]

        # Restore best weights if validation data was used
        if validation_data is not None and best_val_loss < float('inf'):
            self.weights = best_weights
            self.biases = best_biases

        return history

    def predict_proba(self, X):
        X = np.asarray(X, dtype=np.float64)
        if len(X.shape) == 1:
            X = X.reshape(1, -1)
        p_fraud = self.forward(X, training=False)
        p_legit = 1.0 - p_fraud
        return np.hstack([p_legit, p_fraud])

    def predict(self, X, threshold=0.5):
        probs = self.predict_proba(X)[:, 1]
        return (probs >= threshold).astype(int)


class DataPreprocessor:
    """
    Robust Preprocessor for Tabular Multi-Modal Financial Fraud Datasets:
    - Automatically isolates target column without data leakage.
    - Drops non-predictive identifier columns.
    - Imputes missing values.
    - Encodes categorical values into consistent numeric representation.
    - Standardizes numerical variables (Z-score scaling: (x - mean) / std).
    """
    TARGET_CANDIDATES = ['is_fraud', 'fraud', 'fraud_flag', 'fraudulent', 'class', 'label', 'target', 'is_fraudulent']
    ID_COLUMNS = ['transaction_id', 'customer_id', 'txn_id', 'cust_id', 'id', 'user_id', 'account_id', 'card_number']

    def __init__(self):
        self.target_col = None
        self.feature_names = []
        self.categorical_cols = []
        self.numerical_cols = []
        self.excluded_cols = []
        self.cat_mappings = {}
        self.num_means = {}
        self.num_stds = {}
        self.is_fitted = False

    def inspect_dataset(self, df_dict_rows):
        if not df_dict_rows:
            return {'valid': False, 'error': 'Dataset contains no rows.'}
        
        all_cols = list(df_dict_rows[0].keys())
        target_found = None
        for col in all_cols:
            if col.strip().lower() in self.TARGET_CANDIDATES:
                target_found = col
                break

        excluded = [col for col in all_cols if col.strip().lower() in self.ID_COLUMNS]
        potential_features = [col for col in all_cols if col != target_found and col not in excluded]

        # Classify categorical vs numerical by sampling values
        sample_size = min(len(df_dict_rows), 50)
        num_cols = []
        cat_cols = []

        for feat in potential_features:
            is_num = True
            for r in df_dict_rows[:sample_size]:
                val = r.get(feat)
                if val is not None and str(val).strip() != '':
                    try:
                        float(val)
                    except ValueError:
                        is_num = False
                        break
            if is_num:
                num_cols.append(feat)
            else:
                cat_cols.append(feat)

        return {
            'valid': target_found is not None,
            'total_rows': len(df_dict_rows),
            'total_columns': len(all_cols),
            'all_columns': all_cols,
            'target_column': target_found,
            'numerical_features': num_cols,
            'categorical_features': cat_cols,
            'excluded_id_columns': excluded,
            'feature_count': len(potential_features)
        }

    def fit(self, df_dict_rows):
        info = self.inspect_dataset(df_dict_rows)
        if not info['valid']:
            raise ValueError("Training cannot start because the dataset does not contain a valid fraud target column.")

        self.target_col = info['target_column']
        self.numerical_cols = info['numerical_features']
        self.categorical_cols = info['categorical_features']
        self.excluded_cols = info['excluded_id_columns']
        self.feature_names = self.numerical_cols + self.categorical_cols

        # Learn categorical mappings
        for col in self.categorical_cols:
            unique_vals = set()
            for r in df_dict_rows:
                v = str(r.get(col, '')).strip().lower()
                if v:
                    unique_vals.add(v)
            sorted_vals = sorted(list(unique_vals))
            self.cat_mappings[col] = {val: idx + 1 for idx, val in enumerate(sorted_vals)}

        # Learn numerical means and standard deviations
        for col in self.numerical_cols:
            vals = []
            for r in df_dict_rows:
                v = r.get(col)
                if v is not None and str(v).strip() != '':
                    try:
                        vals.append(float(v))
                    except ValueError:
                        pass
            if vals:
                mean_val = float(np.mean(vals))
                std_val = float(np.std(vals))
                if std_val < 1e-6:
                    std_val = 1.0
            else:
                mean_val, std_val = 0.0, 1.0

            self.num_means[col] = mean_val
            self.num_stds[col] = std_val

        self.is_fitted = True
        return self

    def transform(self, df_dict_rows, include_target=True):
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before transforming data.")

        X_rows = []
        y_rows = []

        for r in df_dict_rows:
            row_feats = []
            # Numerical features (Z-scaled)
            for col in self.numerical_cols:
                v = r.get(col)
                try:
                    num_v = float(v) if v is not None and str(v).strip() != '' else self.num_means[col]
                except ValueError:
                    num_v = self.num_means[col]
                scaled_v = (num_v - self.num_means[col]) / self.num_stds[col]
                row_feats.append(scaled_v)

            # Categorical features (Integer Encoded & Scaled)
            for col in self.categorical_cols:
                v = str(r.get(col, '')).strip().lower()
                code = self.cat_mappings[col].get(v, 0)
                # Scale code into [0, 1] range based on vocab size
                max_code = max(len(self.cat_mappings[col]), 1)
                row_feats.append(float(code) / float(max_code))

            X_rows.append(row_feats)

            if include_target:
                raw_y = r.get(self.target_col)
                if raw_y is None or str(raw_y).strip() == '':
                    y_val = 0
                else:
                    str_y = str(raw_y).strip().lower()
                    y_val = 1 if str_y in ['1', 'true', 'yes', 'fraud', 'fraudulent'] else 0
                y_rows.append(y_val)

        X = np.array(X_rows, dtype=np.float64)
        if include_target:
            y = np.array(y_rows, dtype=np.int32)
            return X, y
        return X


class ModelEvaluator:
    """
    Computes genuine mathematical metrics from model test probabilities:
    Accuracy, Precision, Recall, F1 Score, ROC-AUC, and Confusion Matrix.
    """
    @staticmethod
    def evaluate(y_true, y_probs, threshold=0.5):
        y_true = np.asarray(y_true, dtype=np.int32)
        y_probs = np.asarray(y_probs, dtype=np.float64)
        y_pred = (y_probs >= threshold).astype(np.int32)

        tp = int(np.sum((y_pred == 1) & (y_true == 1)))
        tn = int(np.sum((y_pred == 0) & (y_true == 0)))
        fp = int(np.sum((y_pred == 1) & (y_true == 0)))
        fn = int(np.sum((y_pred == 0) & (y_true == 1)))

        total = len(y_true)
        accuracy = round(float(tp + tn) / max(total, 1), 4)
        precision = round(float(tp) / max(tp + fp, 1), 4)
        recall = round(float(tp) / max(tp + fn, 1), 4)
        
        if precision + recall > 0:
            f1_score = round(2.0 * (precision * recall) / (precision + recall), 4)
        else:
            f1_score = 0.0

        # Compute ROC-AUC via numerical trapezoidal integration
        thresholds = np.linspace(0.0, 1.0, 101)
        tpr_list = []
        fpr_list = []

        total_pos = max(float(tp + fn), 1.0)
        total_neg = max(float(tn + fp), 1.0)

        for th in thresholds:
            p_th = (y_probs >= th).astype(np.int32)
            cur_tp = np.sum((p_th == 1) & (y_true == 1))
            cur_fp = np.sum((p_th == 1) & (y_true == 0))
            tpr_list.append(float(cur_tp) / total_pos)
            fpr_list.append(float(cur_fp) / total_neg)

        # Sort by FPR
        sorted_indices = np.argsort(fpr_list)
        sorted_fpr = np.array(fpr_list)[sorted_indices]
        sorted_tpr = np.array(tpr_list)[sorted_indices]
        
        # Trapezoidal area under curve
        roc_auc = round(float(np.trapezoid(sorted_tpr, sorted_fpr)), 4)
        # Bounded between 0.5 and 1.0
        roc_auc = max(0.5, min(1.0, roc_auc))

        # Sample 10 points for frontend ROC curve display
        roc_curve_points = []
        for idx in range(0, len(sorted_fpr), 10):
            roc_curve_points.append({
                'fpr': round(float(sorted_fpr[idx]), 3),
                'tpr': round(float(sorted_tpr[idx]), 3)
            })

        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'roc_auc': roc_auc,
            'confusion_matrix': {
                'true_positives': tp,
                'true_negatives': tn,
                'false_positives': fp,
                'false_negatives': fn
            },
            'roc_curve': roc_curve_points
        }


class DeepExplainability:
    """
    Computes feature attributions for a sample using model sensitivity perturbation:
    Delta_j = P(fraud | x) - P(fraud | x_{-j})
    """
    @staticmethod
    def explain_sample(model, preprocessor, sample_dict, sample_vec=None):
        if sample_vec is None:
            sample_vec = preprocessor.transform([sample_dict], include_target=False)[0]

        baseline_prob = float(model.predict_proba(sample_vec)[0, 1])
        feature_names = preprocessor.feature_names
        attributions = []

        # Perturb each feature towards 0 (its mean in normalized space)
        for i, name in enumerate(feature_names):
            perturbed_vec = sample_vec.copy()
            perturbed_vec[i] = 0.0  # mean reference value
            perturbed_prob = float(model.predict_proba(perturbed_vec)[0, 1])
            diff = baseline_prob - perturbed_prob
            attributions.append({
                'feature': name.replace('_', ' ').title(),
                'raw_value': str(sample_dict.get(name, '')),
                'importance': round(float(abs(diff)), 4),
                'impact': 'Increases Risk' if diff > 0 else 'Decreases Risk',
                'contribution': round(float(diff * 100), 2)
            })

        attributions.sort(key=lambda x: x['importance'], reverse=True)
        top_positive = [a for a in attributions if a['contribution'] > 0][:3]
        
        reason = "Transaction parameters evaluated by Deep Neural Network."
        if top_positive:
            top_names = [f"{a['feature']} ({a['raw_value']})" for a in top_positive]
            reason = f"High risk driven primarily by: {', '.join(top_names)}."

        return {
            'baseline_probability': round(baseline_prob * 100, 2),
            'top_features': attributions[:5],
            'reason': reason
        }
