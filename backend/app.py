from flask import Flask, jsonify
from flask_cors import CORS
import os
from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.analytics_routes import analytics_bp
from routes.report_routes import report_bp
from routes.model_routes import model_bp
from routes.genai_routes import genai_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend API calls
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database Schema
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(model_bp, url_prefix='/api')
    app.register_blueprint(genai_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'Explainable Deep Learning Financial Fraud Detection Platform API',
            'version': 'v2.4-DeepXAI'
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"FraudShield AI Backend API running at http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug_mode, use_reloader=False)
