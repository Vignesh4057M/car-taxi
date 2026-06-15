from flask import Flask, jsonify
from flask_cors import CORS
from config.config import Config
from database.db import db
from database.init_db import init_database
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.driver_routes import driver_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True, origins=app.config['CORS_ORIGINS'])
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(driver_bp)

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({'success': False, 'message': 'API not found'}), 404

    @app.errorhandler(500)
    def server_error(_):
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Server error'}), 500

    init_database(app)
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
