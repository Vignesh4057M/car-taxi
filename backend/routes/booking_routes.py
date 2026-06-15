from datetime import datetime
from flask import Blueprint, jsonify, request, session
from sqlalchemy.orm import joinedload
from database.db import db
from middlewares.auth_middleware import user_required
from models.models import Car, Trip
from utils.helpers import calculate_fare, generate_otp, safe_float, safe_int

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/api/my_trips', methods=['GET'])
@user_required
def my_trips():
    trips = (Trip.query
             .options(joinedload(Trip.driver), joinedload(Trip.car))
             .filter_by(customer_email=session['user_email'])
             .order_by(Trip.id.desc())
             .all())
    return jsonify([t.to_dict() for t in trips])

@booking_bp.route('/api/booknow', methods=['POST'])
@user_required
def booknow():
    data = request.get_json(silent=True) or {}
    distance_km = safe_float(data.get('distance_km'), 0)
    car_type = data.get('car_type', 'ac')
    fare_type = data.get('fare_type', 'per_km')
    total_fare = calculate_fare(distance_km, car_type, fare_type)
    otp = generate_otp()

    trip = Trip(
        driver_id=data.get('driver_id') or None,
        car_id=data.get('car_id') or None,
        pickup_location=data.get('pickup_location'),
        drop_location=data.get('drop_location'),
        trip_date=data.get('trip_date'),
        distance_km=distance_km,
        fare_type=fare_type,
        car_type=car_type,
        total_fare=total_fare,
        customer_name=data.get('customer_name'),
        customer_email=session['user_email'],
        customer_phone=data.get('customer_phone'),
        customer_age=safe_int(data.get('customer_age'), 0),
        notes=data.get('trip_notes', ''),
        passengers_accompanying=safe_int(data.get('passengers_accompanying'), 1),
        status='Pending',
        otp=otp,
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(trip)
    if trip.car_id:
        car = Car.query.get(trip.car_id)
        if car:
            car.status = 'booked'
    db.session.commit()
    return jsonify({'success': True, 'message': 'Booking confirmed!', 'trip': trip.to_dict(), 'otp': otp})
