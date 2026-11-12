import datetime
from flask import Blueprint, request, jsonify, Response
import csv
import io
from database import get_db_connection

report_bp = Blueprint('reports', __name__)

@report_bp.route('/reports', methods=['GET'])
def generate_report():
    report_type = request.args.get('type', 'daily') # daily, weekly, monthly, investigation, customer_risk
    
    conn = get_db_connection()
    cursor = conn.cursor()

    date_filter = ""
    params = []
    
    now = datetime.datetime.now()
    
    # --- Build the WHERE clause based on report type ---
    if report_type == 'daily':
        date_filter = "WHERE date(transaction_date) = date(?)"
        params.append(now.strftime('%Y-%m-%d'))
    elif report_type == 'weekly':
        date_filter = "WHERE date(transaction_date) >= date(?, '-7 days')"
        params.append(now.strftime('%Y-%m-%d'))
    elif report_type == 'monthly':
        date_filter = "WHERE date(transaction_date) >= date(?, 'start of month')"
        params.append(now.strftime('%Y-%m-%d'))
    elif report_type == 'customer_risk':
        cursor.execute("SELECT customer_id FROM transactions ORDER BY risk_score DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            date_filter = "WHERE customer_id = ?"
            params.append(row['customer_id'])
    elif report_type == 'investigation':
        cursor.execute("SELECT transaction_id FROM transactions WHERE LOWER(prediction) IN ('fraud', 'fraudulent', 'true', '1') ORDER BY transaction_date DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            date_filter = "WHERE transaction_id = ?"
            params.append(row['transaction_id'])

    # --- Fraud condition using normalized comparison ---
    fraud_condition = "LOWER(prediction) IN ('fraud', 'fraudulent', 'true', '1')"
    and_fraud = f"AND {fraud_condition}" if date_filter else f"WHERE {fraud_condition}"

    # --- All metrics from the same filtered dataset ---
    cursor.execute(f"SELECT COUNT(*) as total FROM transactions {date_filter}", params)
    total_txns = cursor.fetchone()['total'] or 0

    cursor.execute(f"SELECT COUNT(*) as fraud FROM transactions {date_filter} {and_fraud}", params)
    fraud_txns = cursor.fetchone()['fraud'] or 0

    cursor.execute(f"SELECT COALESCE(SUM(amount), 0) as fraud_sum FROM transactions {date_filter} {and_fraud}", params)
    fraud_sum = cursor.fetchone()['fraud_sum'] or 0.0

    # --- Mathematical validation ---
    # Ensure fraud_txns can never exceed total_txns
    if fraud_txns > total_txns:
        fraud_txns = total_txns
    legit_txns = total_txns - fraud_txns

    cursor.execute(f"SELECT * FROM transactions {date_filter} {'AND' if date_filter else 'WHERE'} risk_score >= 60 ORDER BY risk_score DESC LIMIT 10", params)
    high_risk_list = [dict(r) for r in cursor.fetchall()]

    # --- Fraud factors calculated from actual filtered data ---
    factor_queries = f"""
    SELECT 
        SUM(CASE WHEN amount > 50000 THEN 1 ELSE 0 END) as high_amount_count,
        SUM(is_new_device) as new_device_count,
        SUM(CASE WHEN distance_from_usual_location > 500 THEN 1 ELSE 0 END) as location_anomaly_count,
        SUM(CASE WHEN transactions_last_24_hours > 5 THEN 1 ELSE 0 END) as high_velocity_count,
        SUM(vpn_detected) as vpn_count,
        SUM(proxy_detected) as proxy_count,
        SUM(foreign_transaction) as foreign_txn_count
    FROM transactions {date_filter}
    """
    cursor.execute(factor_queries, params)
    factors_data = cursor.fetchone()
    conn.close()

    # --- Fraud rate (safe division) ---
    fraud_rate = round((fraud_txns / total_txns) * 100, 2) if total_txns > 0 else 0.0
    
    # --- Build fraud factors from actual data ---
    factors_dict = {
        "Unusually High Amount": factors_data['high_amount_count'] if factors_data else 0,
        "New Unrecognized Device": factors_data['new_device_count'] if factors_data else 0,
        "Location Anomaly (> 500 km)": factors_data['location_anomaly_count'] if factors_data else 0,
        "High Velocity Transactions": factors_data['high_velocity_count'] if factors_data else 0,
        "VPN Detected": factors_data['vpn_count'] if factors_data else 0,
        "Proxy Detected": factors_data['proxy_count'] if factors_data else 0,
        "Foreign Transaction": factors_data['foreign_txn_count'] if factors_data else 0
    }
    
    # Safely convert to int or 0 if None
    factors_dict = {k: (int(v) if v is not None else 0) for k, v in factors_dict.items()}
    
    sorted_factors = sorted(factors_dict.items(), key=lambda item: item[1], reverse=True)
    
    top_fraud_factors = []
    recommendations = []
    
    for factor, count in sorted_factors[:5]:
        if total_txns == 0:
            top_fraud_factors.append({"factor": factor, "frequency": "No sufficient data"})
        elif count > 0:
            percentage = round((count / total_txns) * 100, 1)
            top_fraud_factors.append({
                "factor": factor,
                "frequency": f"{percentage}% of cases ({count})"
            })
            
            if factor == "Unusually High Amount":
                recommendations.append("Enforce Mandatory 2FA for transactions over ₹50,000 originating from new devices.")
            elif factor == "New Unrecognized Device":
                recommendations.append("Implement email/SMS verification for logins from unrecognized devices.")
            elif factor == "Location Anomaly (> 500 km)":
                recommendations.append("Auto-block cross-border wire transfers exceeding 500 km distance from home location without prior OTP authorization.")
            elif factor == "High Velocity Transactions":
                recommendations.append("Implement velocity cap limits for accounts attempting > 5 transactions per 24 hours.")
            elif factor == "VPN Detected" or factor == "Proxy Detected":
                if "Flag VPN or Proxy IP addresses for manual analyst clearance." not in recommendations:
                    recommendations.append("Flag VPN or Proxy IP addresses for manual analyst clearance.")
            elif factor == "Foreign Transaction":
                recommendations.append("Require travel notification or advanced clearance for foreign transactions.")

    if not recommendations:
        recommendations.append("Continue monitoring standard transaction risk indicators.")

    if not top_fraud_factors:
        top_fraud_factors.append({"factor": "No significant risk factors", "frequency": "No sufficient data"})

    generated_at = now.isoformat() + "Z"
    
    report_title_map = {
        'daily': 'DAILY FRAUD REPORT',
        'weekly': 'WEEKLY SUMMARY',
        'monthly': 'MONTHLY EXECUTIVE REPORT',
        'investigation': 'TRANSACTION INVESTIGATION',
        'customer_risk': 'CUSTOMER RISK PROFILE'
    }

    return jsonify({
        'report_type': report_title_map.get(report_type, report_type.upper()),
        'generated_at': generated_at,
        'metrics': {
            'total_transactions': total_txns,
            'fraud_transactions': fraud_txns,
            'legitimate_transactions': legit_txns,
            'fraud_percentage': f"{fraud_rate}%",
            'fraud_amount_detected': f"₹{fraud_sum:,.2f}"
        },
        'top_fraud_factors': top_fraud_factors,
        'highest_risk_transactions': high_risk_list,
        'recommendations': recommendations
    }), 200

@report_bp.route('/reports/export', methods=['GET'])
def export_csv():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT transaction_id, customer_id, amount, transaction_type, merchant_name, merchant_category, transaction_date, device_type, is_new_device, distance_from_usual_location, risk_score, risk_level, prediction FROM transactions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID", "Customer ID", "Amount", "Type", "Merchant", "Category", 
        "Date", "Device Type", "New Device", "Distance (km)", "Risk Score", "Risk Level", "Prediction"
    ])

    for row in rows:
        writer.writerow(list(row))

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=fraud_detection_report.csv"}
    )
