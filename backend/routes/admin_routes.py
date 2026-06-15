from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash
from sqlalchemy.orm import joinedload

from database.db import db
from middlewares.auth_middleware import admin_required
from models.models import Car, Driver, Trip

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/drivers', methods=['GET'])
def get_drivers():
    # Public in original project because booking page loads drivers.
    drivers = Driver.query.order_by(Driver.id.desc()).all()
    return jsonify([d.to_dict() for d in drivers])

@admin_bp.route('/api/drivers', methods=['POST'])
@admin_required
def create_driver():
    data = request.get_json(silent=True) or {}
    pwd = data.get('password')
    driver = Driver(
        name=data.get('name'), age=data.get('age'), phone=data.get('phone'),
        email=data.get('email'), license=data.get('license'), expiry=data.get('expiry'),
        address=data.get('address'), notes=data.get('notes'), experience=data.get('experience', '0'),
        password=generate_password_hash(pwd) if pwd else None
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify({'success': True, 'driver': driver.to_dict()})

@admin_bp.route('/api/drivers/<int:driver_id>', methods=['PUT'])
@admin_required
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json(silent=True) or {}
    for field in ['name', 'age', 'phone', 'email', 'license', 'expiry', 'address', 'notes', 'experience']:
        if field in data:
            setattr(driver, field, data[field])
    if data.get('password'):
        driver.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'success': True, 'driver': driver.to_dict()})

@admin_bp.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
@admin_required
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({'success': True})

@admin_bp.route('/api/cars', methods=['GET'])
def get_cars():
    # Public in original project because booking page loads cars.
    cars = Car.query.order_by(Car.id.desc()).all()
    return jsonify([c.to_dict() for c in cars])

@admin_bp.route('/api/cars', methods=['POST'])
@admin_required
def create_car():
    data = request.get_json(silent=True) or {}
    car = Car(
        make=data.get('make'), model=data.get('model'), year=data.get('year'),
        license_plate=data.get('license_plate'), insurance_no=data.get('insurance_no'),
        color=data.get('color'), seating_capacity=data.get('seating_capacity'),
        notes=data.get('notes'), status=data.get('status', 'available'),
        emi_date=data.get('emi_date') or None, service_date=data.get('service_date') or None,
        driver_id=data.get('driver_id') or None
    )
    db.session.add(car)
    db.session.commit()
    return jsonify({'success': True, 'car': car.to_dict()})

@admin_bp.route('/api/cars/<int:car_id>', methods=['PUT'])
@admin_required
def update_car(car_id):
    car = Car.query.get_or_404(car_id)
    data = request.get_json(silent=True) or {}
    for field in ['make','model','year','license_plate','insurance_no','color','seating_capacity','notes','status','driver_id']:
        if field in data:
            setattr(car, field, (data[field] or None) if field == 'driver_id' else data[field])
    if 'emi_date' in data:
        car.emi_date = data['emi_date'] or None
    if 'service_date' in data:
        car.service_date = data['service_date'] or None
    db.session.commit()
    return jsonify({'success': True, 'car': car.to_dict()})

@admin_bp.route('/api/cars/<int:car_id>', methods=['DELETE'])
@admin_required
def delete_car(car_id):
    car = Car.query.get_or_404(car_id)
    db.session.delete(car)
    db.session.commit()
    return jsonify({'success': True})

@admin_bp.route('/api/trips', methods=['GET'])
@admin_required
def get_trips():
    trips = Trip.query.options(joinedload(Trip.driver), joinedload(Trip.car)).order_by(Trip.id.desc()).all()
    return jsonify([t.to_dict() for t in trips])
