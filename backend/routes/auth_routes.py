from flask import Blueprint, current_app, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from backend.database.db import db
from backend.models.models import Driver, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/session')
def get_session():
    return jsonify({
        'user_email': session.get('user_email'),
        'user_logged_in': session.get('user_logged_in', False),
        'admin_logged_in': session.get('admin_logged_in', False),
        'driver_logged_in': session.get('driver_logged_in', False),
        'driver_id': session.get('driver_id'),
        'driver_name': session.get('driver_name'),
    })

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username_email = data.get('username', '')
    password = data.get('password', '')

    if username_email == current_app.config['ADMIN_USER'] and password == current_app.config['ADMIN_PASS']:
        session.clear()
        session['admin_logged_in'] = True
        return jsonify({'success': True, 'message': 'Admin logged in!',
                        'session': {'admin_logged_in': True, 'user_email': None}})

    user = User.query.filter((User.username == username_email) | (User.email == username_email)).first()
    if user and check_password_hash(user.password, password):
        session.clear()
        session['user_logged_in'] = True
        session['user_email'] = user.email
        return jsonify({'success': True, 'message': f'Welcome {user.username}!',
                        'session': {'user_logged_in': True, 'user_email': user.email, 'admin_logged_in': False}})

    return jsonify({'success': False, 'message': 'Invalid credentials'})

@auth_bp.route('/api/driver/login', methods=['POST'])
def driver_login():
    data = request.get_json(silent=True) or {}
    phone_or_email = data.get('username', '')
    password = data.get('password', '')
    driver = Driver.query.filter((Driver.phone == phone_or_email) | (Driver.email == phone_or_email)).first()
    if not driver:
        return jsonify({'success': False, 'message': 'Driver not found'})
    if not driver.password:
        return jsonify({'success': False, 'message': 'No password set. Contact admin.'})
    if not check_password_hash(driver.password, password):
        return jsonify({'success': False, 'message': 'Invalid password'})
    session.clear()
    session['driver_logged_in'] = True
    session['driver_id'] = driver.id
    session['driver_name'] = driver.name
    return jsonify({'success': True, 'message': f'Welcome {driver.name}!',
                    'session': {'driver_logged_in': True, 'driver_id': driver.id, 'driver_name': driver.name}})

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    username = data.get('username', '').strip()
    phone = data.get('phone', '').strip()
    if not email or not password or not username or not phone:
        return jsonify({'success': False, 'message': 'All fields are required'})
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered'})
    user = User(username=username, email=email, phone=phone, password=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    session.clear()
    session['user_logged_in'] = True
    session['user_email'] = email
    return jsonify({'success': True, 'message': 'Registered successfully!',
                    'session': {'user_logged_in': True, 'user_email': email, 'admin_logged_in': False}})
