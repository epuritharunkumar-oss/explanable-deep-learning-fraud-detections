def generate_explainability(raw_data, features, fraud_probability, risk_score):
    """
    Generates Explainable AI (SHAP/LIME style) feature contribution vectors,
    5-Modality breakdown risk scores, and natural language explanations.
    """
    factors = []
    
    # 1. Transaction Amount Impact
    if features['amount'] > 50000 or features['amount_ratio'] > 4.0:
        impact = min(0.35, round(0.15 + (features['amount'] / 250000) * 0.20, 2))
        factors.append({
            "feature": "Transaction Amount",
            "impact": impact,
            "direction": "fraud",
            "description": f"Unusually high transaction amount (₹{features['amount']:,.2f})"
        })
    elif features['amount'] < 5000:
        factors.append({
            "feature": "Transaction Amount",
            "impact": -0.10,
            "direction": "legitimate",
            "description": "Normal low transaction amount within routine spending limits"
        })

    # 2. Location Distance Impact
    if features['distance'] > 50:
        impact = min(0.28, round(0.08 + (features['distance'] / 1000) * 0.20, 2))
        factors.append({
            "feature": "Location Distance",
            "impact": impact,
            "direction": "fraud",
            "description": f"Transaction recorded {features['distance']} km away from customer's usual location"
        })
    else:
        factors.append({
            "feature": "Location Distance",
            "impact": -0.12,
            "direction": "legitimate",
            "description": "Transaction originated near customer's primary registered location"
        })

    # 3. Device Characteristics Impact
    if features['is_new_device']:
        factors.append({
            "feature": "New Device Used",
            "impact": 0.22,
            "direction": "fraud",
            "description": "Transaction attempted from a previously unseen device"
        })
    else:
        factors.append({
            "feature": "Recognized Device",
            "impact": -0.15,
            "direction": "legitimate",
            "description": "Transaction executed on a known trusted device"
        })

    # 4. Temporal Velocity (Transactions in last hour)
    if features['txns_1h'] >= 3:
        factors.append({
            "feature": "Transaction Velocity (1h)",
            "impact": min(0.25, round(features['txns_1h'] * 0.06, 2)),
            "direction": "fraud",
            "description": f"High burst velocity: {features['txns_1h']} transactions in the last hour"
        })

    # 5. Failed Login Attempts
    if features['failed_logins'] > 0:
        factors.append({
            "feature": "Failed Login Attempts",
            "impact": min(0.20, round(features['failed_logins'] * 0.05, 2)),
            "direction": "fraud",
            "description": f"{features['failed_logins']} failed login attempt(s) prior to transaction"
        })

    # 6. Foreign / VPN / Proxy Detection
    if features['foreign_txn']:
        factors.append({
            "feature": "Foreign Transaction",
            "impact": 0.18,
            "direction": "fraud",
            "description": "Cross-border transaction detected from international IP address"
        })

    if features['vpn_detected'] or features['proxy_detected']:
        factors.append({
            "feature": "VPN/Proxy Detection",
            "impact": 0.16,
            "direction": "fraud",
            "description": "Anonymized network connection (VPN/Proxy) active during transaction"
        })

    # 7. Account History
    if features['account_age'] > 24:
        factors.append({
            "feature": "Account Maturity",
            "impact": -0.14,
            "direction": "legitimate",
            "description": f"Established customer account age ({features['account_age']} months)"
        })
    elif features['account_age'] < 3:
        factors.append({
            "feature": "New Account Age",
            "impact": 0.12,
            "direction": "fraud",
            "description": "Recently created account (less than 3 months old)"
        })

    # 8. High Risk Merchant Category
    if features['merchant_risk'] > 1.2:
        factors.append({
            "feature": "Merchant Risk Rating",
            "impact": 0.15,
            "direction": "fraud",
            "description": f"Transaction with high-risk merchant category ({raw_data.get('merchant_category', 'High-Risk')})"
        })

    # Sort factors by magnitude
    factors.sort(key=lambda x: abs(x['impact']), reverse=True)

    # Dynamic Modality Raw Contributions
    t_raw = max(0.1, float((features['amount'] / 100000) * 50 + (features['merchant_risk'] - 1.0) * 30 + 10))
    b_raw = max(0.1, float(features['amount_ratio'] * 15 + features['prev_fraud'] * 25 + (12 / max(features['account_age'], 1)) * 10))
    d_raw = max(0.1, float(features['is_new_device'] * 50 + features['vpn_detected'] * 30 + features['proxy_detected'] * 20 + 5))
    l_raw = max(0.1, float((features['distance'] / 1000) * 60 + features['foreign_txn'] * 40 + 5))
    ts_raw = max(0.1, float(features['txns_1h'] * 20 + features['failed_logins'] * 20 + (1 - features['otp_verified']) * 30 + 5))

    raw_items = [
        ("transaction_risk", t_raw),
        ("behaviour_risk", b_raw),
        ("device_risk", d_raw),
        ("location_risk", l_raw),
        ("temporal_security_risk", ts_raw)
    ]
    total_raw = sum(score for _, score in raw_items)

    # Normalize contributions so they sum to exactly 100% (Largest Remainder Method)
    shares = []
    for key, score in raw_items:
        exact_share = (score / total_raw * 100.0) if total_raw > 0 else 20.0
        floor_val = int(exact_share)
        rem = exact_share - floor_val
        shares.append({"key": key, "floor": floor_val, "rem": rem})

    remaining = 100 - sum(s["floor"] for s in shares)
    shares.sort(key=lambda s: s["rem"], reverse=True)
    for i in range(remaining):
        shares[i]["floor"] += 1

    modality_breakdown = {s["key"]: s["floor"] for s in shares}
    modality_breakdown["overall_fraud_risk"] = risk_score

    # Generate Dynamic Natural Language Text Explanation
    fraud_reasons = [f['description'] for f in factors if f['direction'] == 'fraud']
    legit_reasons = [f['description'] for f in factors if f['direction'] == 'legitimate']

    if risk_score >= 60:
        reasons_summary = ". ".join(fraud_reasons[:4])
        narrative = (
            f"This transaction was classified as {risk_score}% risk ({'CRITICAL' if risk_score >= 80 else 'HIGH'}) "
            f"primarily because of multiple anomalous indicators: {reasons_summary}."
        )
    elif risk_score >= 35:
        reasons_summary = ". ".join(fraud_reasons[:2]) if fraud_reasons else "minor deviation in transaction frequency"
        narrative = (
            f"This transaction was evaluated as MEDIUM risk ({risk_score}% risk score) requiring additional verification. "
            f"Key risk factors include {reasons_summary}."
        )
    else:
        legit_summary = ". ".join(legit_reasons[:3]) if legit_reasons else "normal transaction behavioral parameters"
        narrative = (
            f"This transaction was classified as LEGITIMATE with a low risk score of {risk_score}%. "
            f"The prediction is supported by {legit_summary}."
        )

    return {
        "factors": factors,
        "modality_breakdown": modality_breakdown,
        "narrative_explanation": narrative,
        "top_fraud_factors": [f for f in factors if f['direction'] == 'fraud'],
        "top_legitimate_factors": [f for f in factors if f['direction'] == 'legitimate']
    }
