from datetime import date, timedelta
from flask import Blueprint, jsonify, request, session
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from backend.database.db import db
from backend.middlewares.auth_middleware import driver_required
from backend.models.models import Car, Driver, Trip

driver_bp = Blueprint('driver', __name__)

@driver_bp.route('/api/driver/profile', methods=['GET'])
@driver_required
def driver_profile():
    driver = Driver.query.get(session['driver_id'])
    if not driver:
        return jsonify({'success': False, 'message': 'Driver not found'}), 404
    car = Car.query.filter_by(driver_id=driver.id).first()
    profile = driver.to_dict()
    profile['car'] = car.to_dict() if car else None
    return jsonify(profile)

@driver_bp.route('/api/driver/toggle_status', methods=['POST'])
@driver_required
def toggle_driver_status():
    driver = Driver.query.get(session['driver_id'])
    if not driver:
        return jsonify({'success': False, 'message': 'Driver not found'}), 404
    driver.is_online = not driver.is_online
    db.session.commit()
    return jsonify({'success': True, 'is_online': driver.is_online})

@driver_bp.route('/api/driver/trips', methods=['GET'])
@driver_required
def driver_trips():
    trips = (Trip.query
             .options(joinedload(Trip.driver), joinedload(Trip.car))
             .filter_by(driver_id=session['driver_id'])
             .order_by(Trip.id.desc())
             .all())
    return jsonify([t.to_dict() for t in trips])

@driver_bp.route('/api/driver/trips/<int:trip_id>/action', methods=['POST'])
@driver_required
def driver_trip_action(trip_id):
    trip = Trip.query.options(joinedload(Trip.car)).get_or_404(trip_id)
    if trip.driver_id != session['driver_id']:
        return jsonify({'success': False, 'message': 'Not your trip'}), 403
    data = request.get_json(silent=True) or {}
    action = data.get('action')

    if action == 'accept':
        trip.status = 'Accepted'
    elif action == 'reject':
        trip.status = 'Rejected'
    elif action == 'reached_pickup':
        trip.status = 'Reached Pickup'
    elif action == 'start':
        if data.get('otp', '') != trip.otp:
            return jsonify({'success': False, 'message': 'Incorrect OTP'})
        trip.status = 'Trip Started'
    elif action == 'complete':
        trip.status = 'Trip Completed'
        if trip.car:
            trip.car.status = 'available'
    elif action == 'cancel':
        trip.status = 'Cancelled'
        if trip.car:
            trip.car.status = 'available'
    else:
        return jsonify({'success': False, 'message': 'Invalid action'}), 400

    db.session.commit()
    return jsonify({'success': True, 'trip': trip.to_dict()})

@driver_bp.route('/api/driver/dashboard', methods=['GET'])
@driver_required
def driver_dashboard():
    driver_id = session['driver_id']
    today = date.today().strftime('%Y-%m-%d')
    week_ago = (date.today() - timedelta(days=7)).strftime('%Y-%m-%d')
    month_ago = (date.today() - timedelta(days=30)).strftime('%Y-%m-%d')

    base = Trip.query.filter_by(driver_id=driver_id)
    today_trips = base.filter(Trip.trip_date.like(f'{today}%')).count()
    pending = base.filter_by(status='Pending').count()
    completed = base.filter_by(status='Trip Completed').count()
    today_earnings = db.session.query(func.coalesce(func.sum(Trip.total_fare), 0)).filter(
        Trip.driver_id == driver_id, Trip.status == 'Trip Completed', Trip.trip_date.like(f'{today}%')
    ).scalar()
    weekly_earnings = db.session.query(func.coalesce(func.sum(Trip.total_fare), 0)).filter(
        Trip.driver_id == driver_id, Trip.status == 'Trip Completed', Trip.trip_date >= week_ago
    ).scalar()
    monthly_earnings = db.session.query(func.coalesce(func.sum(Trip.total_fare), 0)).filter(
        Trip.driver_id == driver_id, Trip.status == 'Trip Completed', Trip.trip_date >= month_ago
    ).scalar()

    driver = Driver.query.get(driver_id)
    return jsonify({
        'today_trips': today_trips,
        'pending_trips': pending,
        'completed_trips': completed,
        'today_earnings': float(today_earnings or 0),
        'weekly_earnings': float(weekly_earnings or 0),
        'monthly_earnings': float(monthly_earnings or 0),
        'is_online': driver.is_online if driver else False,
        'driver_name': driver.name if driver else None,
    })
