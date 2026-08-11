"""
Seed script -- creates 5 default users with REAL BCrypt-hashed passwords
(compatible with Spring Security's BCryptPasswordEncoder, since bcrypt is
a standard algorithm implemented identically across languages), plus
sample appliances and a meter for the first user.

Requires the `bcrypt` package:
    pip install bcrypt --break-system-packages

Run:
    python seed.py
"""
import bcrypt
from database import SessionLocal, init_db
from models import User, Appliance, Meter

init_db()
db = SessionLocal()

DEFAULT_USERS = [
    {"full_name": "Kwaku Owusu",      "email": "kwaku@enersence.com",   "password": "kwaku123",   "role": "ADMIN"},
    {"full_name": "Ama Serwaa",       "email": "ama@enersence.com",     "password": "ama123",     "role": "USER"},
    {"full_name": "Kofi Mensah",      "email": "kofi@enersence.com",    "password": "kofi123",    "role": "USER"},
    {"full_name": "Abena Asante",     "email": "abena@enersence.com",   "password": "abena123",   "role": "USER"},
    {"full_name": "Yaw Boateng",      "email": "yaw@enersence.com",     "password": "yaw123",     "role": "USER"},
]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


created_users = []

for u in DEFAULT_USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        print(f"Already exists: {u['email']} (user_id={existing.user_id})")
        created_users.append(existing)
        continue

    user = User(
        full_name=u["full_name"],
        email=u["email"],
        password_hash=hash_password(u["password"]),
        role=u["role"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    created_users.append(user)
    print(f"Created: {u['email']} / {u['password']}  (user_id={user.user_id}, role={u['role']})")

# Sample appliances + a meter for the first user, so the dashboard isn't
# empty on first login.
first_user = created_users[0]
existing_appliance = db.query(Appliance).filter(Appliance.user_id == first_user.user_id).first()

if not existing_appliance:
    fridge = Appliance(
        user_id=first_user.user_id,
        appliance_name="Refrigerator",
        category="Kitchen",
        power_rating_watts=150,
        location="Kitchen",
    )
    ac = Appliance(
        user_id=first_user.user_id,
        appliance_name="Air Conditioner",
        category="Cooling",
        power_rating_watts=1500,
        location="Living Room",
    )
    db.add_all([fridge, ac])

    meter = Meter(
        user_id=first_user.user_id,
        meter_name="Main Utility Meter",
        serial_number="LUM-8829-X",
        meter_type="utility",
        status="ONLINE",
        last_reading_kwh=452.1,
    )
    db.add(meter)
    db.commit()
    print(f"Added sample appliances + meter for {first_user.email}")

db.close()

print("\n--- Login credentials for the demo ---")
for u in DEFAULT_USERS:
    print(f"  {u['email']}  /  {u['password']}   (role: {u['role']})")
