from functools import wraps
from flask import jsonify, session

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'success': False, 'message': 'Admin only'}), 403
        return fn(*args, **kwargs)
    return wrapper

def user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('user_email'):
            return jsonify({'success': False, 'message': 'Login required'}), 401
        return fn(*args, **kwargs)
    return wrapper

def driver_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('driver_logged_in'):
            return jsonify({'success': False, 'message': 'Driver login required'}), 401
        return fn(*args, **kwargs)
    return wrapper
