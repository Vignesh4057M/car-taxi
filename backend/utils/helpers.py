import random
import string

def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def calculate_fare(distance_km, car_type='ac', fare_type='per_km'):
    driver_charge = 300
    padi_charge = 500
    if fare_type == 'per_km':
        rate = 13 if car_type == 'ac' else 12
        return distance_km * rate + driver_charge + padi_charge
    base = 1200 if car_type == 'ac' else 1000
    extra = max(0, distance_km - 250) * (13 if car_type == 'ac' else 12)
    return base + extra + driver_charge + padi_charge
