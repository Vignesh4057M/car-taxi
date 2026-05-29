from backend.database.db import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Driver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), index=True)
    age = db.Column(db.Integer)
    phone = db.Column(db.String(50), index=True)
    email = db.Column(db.String(100), index=True)
    license = db.Column(db.String(50))
    expiry = db.Column(db.String(50))
    address = db.Column(db.String(200))
    notes = db.Column(db.Text)
    password = db.Column(db.String(200))
    experience = db.Column(db.String(50), default="0")
    is_online = db.Column(db.Boolean, default=False, index=True)
    trips = db.relationship('Trip', backref='driver', cascade="all, delete-orphan", lazy='select')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'age': self.age,
            'phone': self.phone, 'email': self.email, 'license': self.license,
            'expiry': self.expiry, 'address': self.address, 'notes': self.notes,
            'experience': self.experience, 'is_online': self.is_online
        }

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(100))
    model = db.Column(db.String(100))
    year = db.Column(db.String(10))
    license_plate = db.Column(db.String(50), index=True)
    insurance_no = db.Column(db.String(50))
    color = db.Column(db.String(50))
    seating_capacity = db.Column(db.Integer)
    notes = db.Column(db.Text)
    status = db.Column(db.String(50), default="available", index=True)
    emi_date = db.Column(db.String(50), nullable=True)
    service_date = db.Column(db.String(50), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('driver.id'), nullable=True, index=True)
    trips = db.relationship('Trip', backref='car', cascade="all, delete-orphan", lazy='select')

    def to_dict(self):
        return {
            'id': self.id, 'make': self.make, 'model': self.model,
            'year': self.year, 'license_plate': self.license_plate,
            'insurance_no': self.insurance_no, 'color': self.color,
            'seating_capacity': self.seating_capacity, 'notes': self.notes,
            'status': self.status, 'emi_date': self.emi_date,
            'service_date': self.service_date, 'driver_id': self.driver_id
        }

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('driver.id'), index=True)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), index=True)
    pickup_location = db.Column(db.String(200))
    drop_location = db.Column(db.String(200))
    trip_date = db.Column(db.String(50), index=True)
    distance_km = db.Column(db.Float)
    fare_type = db.Column(db.String(50))
    car_type = db.Column(db.String(50))
    total_fare = db.Column(db.Float)
    customer_name = db.Column(db.String(100))
    customer_email = db.Column(db.String(100), index=True)
    customer_phone = db.Column(db.String(50))
    customer_age = db.Column(db.Integer)
    notes = db.Column(db.Text)
    passengers_accompanying = db.Column(db.Integer)
    status = db.Column(db.String(50), default="Pending", index=True)
    otp = db.Column(db.String(10))
    created_at = db.Column(db.String(50), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None,
            'car_id': self.car_id,
            'car_make': self.car.make if self.car else None,
            'car_model': self.car.model if self.car else None,
            'car_plate': self.car.license_plate if self.car else None,
            'pickup_location': self.pickup_location,
            'drop_location': self.drop_location,
            'trip_date': self.trip_date,
            'distance_km': self.distance_km,
            'fare_type': self.fare_type,
            'car_type': self.car_type,
            'total_fare': self.total_fare,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'customer_age': self.customer_age,
            'notes': self.notes,
            'passengers_accompanying': self.passengers_accompanying,
            'status': self.status,
            'otp': self.otp,
            'created_at': self.created_at,
        }
