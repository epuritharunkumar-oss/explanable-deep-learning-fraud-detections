from flask import Blueprint, request, jsonify
from database import get_db_connection

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard/statistics', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM transactions")
    total_txns = cursor.fetchone()['total'] or 0

    cursor.execute("SELECT COUNT(*) as fraud FROM transactions WHERE prediction = 'Fraudulent'")
    fraud_txns = cursor.fetchone()['fraud'] or 0

    cursor.execute("SELECT COUNT(*) as legit FROM transactions WHERE prediction = 'Legitimate'")
    legit_txns = cursor.fetchone()['legit'] or 0

    cursor.execute("SELECT COUNT(*) as high_risk FROM transactions WHERE risk_score >= 60")
    high_risk_count = cursor.fetchone()['high_risk'] or 0

    cursor.execute("SELECT SUM(amount) as fraud_sum FROM transactions WHERE prediction = 'Fraudulent'")
    fraud_sum_val = cursor.fetchone()['fraud_sum'] or 0.0

    fraud_rate = round((fraud_txns / max(total_txns, 1)) * 100, 2)

    # Fetch recent transactions
    cursor.execute("SELECT * FROM transactions ORDER BY id DESC LIMIT 10")
    recent = [dict(row) for row in cursor.fetchall()]

    # Risk level distribution
    cursor.execute("SELECT risk_level, COUNT(*) as cnt FROM transactions GROUP BY risk_level")
    risk_distribution = {row['risk_level']: row['cnt'] for row in cursor.fetchall()}

    # Real fraud by transaction type
    cursor.execute('''
        SELECT transaction_type, COUNT(*) as cnt 
        FROM transactions 
        WHERE prediction = 'Fraudulent' 
        GROUP BY transaction_type 
        ORDER BY cnt DESC
    ''')
    fraud_by_type = [{'type': row['transaction_type'], 'count': row['cnt']} for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'total_transactions': total_txns,
        'fraudulent_transactions': fraud_txns,
        'legitimate_transactions': legit_txns,
        'fraud_rate': f"{fraud_rate}%",
        'high_risk_transactions': high_risk_count,
        'fraud_amount_detected': fraud_sum_val,
        'formatted_fraud_amount': f"₹{fraud_sum_val:,.2f}",
        'risk_distribution': risk_distribution,
        'fraud_by_type': fraud_by_type,
        'recent_transactions': recent
    }), 200

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    time_range = request.args.get('range', '7days')
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fraud by Transaction Type
    cursor.execute('''
        SELECT transaction_type, 
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN amount ELSE 0 END) as fraud_amount
        FROM transactions
        GROUP BY transaction_type
    ''')
    by_type = [dict(r) for r in cursor.fetchall()]

    # Fraud by Merchant Category
    cursor.execute('''
        SELECT merchant_category,
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count
        FROM transactions
        GROUP BY merchant_category
    ''')
    by_merchant = [dict(r) for r in cursor.fetchall()]

    # Fraud by Device Type
    cursor.execute('''
        SELECT device_type,
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count
        FROM transactions
        GROUP BY device_type
    ''')
    by_device = [dict(r) for r in cursor.fetchall()]

    # Top High-Risk Customers
    cursor.execute('''
        SELECT customer_id,
               COUNT(*) as total_txns,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_txns,
               AVG(risk_score) as avg_risk_score,
               SUM(amount) as total_spent
        FROM transactions
        GROUP BY customer_id
        HAVING fraud_txns > 0
        ORDER BY avg_risk_score DESC
        LIMIT 5
    ''')
    top_customers = [dict(r) for r in cursor.fetchall()]

    # Fraud Trend Over Hours (0-23)
    cursor.execute('''
        SELECT SUBSTR(transaction_time, 1, 2) as hour_str,
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count
        FROM transactions
        GROUP BY hour_str
        ORDER BY hour_str ASC
    ''')
    by_hour = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'by_type': by_type,
        'by_merchant': by_merchant,
        'by_device': by_device,
        'by_hour': by_hour,
        'top_high_risk_customers': top_customers
    }), 200

@analytics_bp.route('/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT fa.*, t.customer_id, t.amount, t.transaction_type, t.created_at as txn_date
        FROM fraud_alerts fa
        LEFT JOIN transactions t ON fa.transaction_id = t.transaction_id
        ORDER BY fa.id DESC
    ''')
    alerts = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Summary counts
    critical = sum(1 for a in alerts if a['risk_score'] >= 80)
    high = sum(1 for a in alerts if 60 <= a['risk_score'] < 80)
    medium = sum(1 for a in alerts if 30 <= a['risk_score'] < 60)
    resolved = sum(1 for a in alerts if a['status'] == 'Resolved')

    return jsonify({
        'alerts': alerts,
        'summary': {
            'critical': critical,
            'high': high,
            'medium': medium,
            'resolved': resolved,
            'total': len(alerts)
        }
    }), 200

@analytics_bp.route('/alerts/<alert_id>', methods=['PUT'])
def update_alert_status(alert_id):
    data = request.get_json() or {}
    new_status = data.get('status', 'Investigating')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE fraud_alerts 
        SET status = ?, resolved_at = CURRENT_TIMESTAMP
        WHERE id = ? OR transaction_id = ?
    ''', (new_status, alert_id, alert_id))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Alert status updated to {new_status}'}), 200
