from flask import Blueprint, request, jsonify
from services.genai_service import (
    generate_forensic_analysis,
    generate_sar_report,
    chat_with_copilot,
    generate_fraud_scenario
)
from ml.fraud_predictor import predict_transaction

genai_bp = Blueprint('genai', __name__)

@genai_bp.route('/genai/explain', methods=['POST'])
def explain():
    data = request.get_json() or {}
    txn = data.get('transaction', {})
    ml_result = data.get('ml_result')
    if not ml_result:
        ml_result = predict_transaction(txn)

    analysis_md = generate_forensic_analysis(txn, ml_result)
    return jsonify({
        'analysis': analysis_md,
        'model_verdict': ml_result.get('prediction'),
        'risk_score': ml_result.get('risk_score')
    }), 200

@genai_bp.route('/genai/sar', methods=['POST'])
def sar():
    data = request.get_json() or {}
    txn = data.get('transaction', {})
    ml_result = data.get('ml_result')
    if not ml_result:
        ml_result = predict_transaction(txn)

    sar_text = generate_sar_report(txn, ml_result)
    return jsonify({
        'sar_document': sar_text,
        'transaction_id': txn.get('transaction_id')
    }), 200

@genai_bp.route('/genai/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    context = data.get('context', {})
    history = data.get('history', [])

    if not query:
        return jsonify({'error': 'Query string cannot be empty'}), 400

    reply = chat_with_copilot(query, context, history)
    return jsonify({
        'reply': reply,
        'query': query
    }), 200

@genai_bp.route('/genai/generate-scenario', methods=['POST'])
def scenario():
    data = request.get_json() or {}
    scenario_type = data.get('scenario_type', 'sim_swap')
    scen_data = generate_fraud_scenario(scenario_type)
    return jsonify(scen_data), 200
