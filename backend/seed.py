from app import app, db
from models import User, VehicleEntry
from faker import Faker
import random

fake = Faker()

with app.app_context():
    # Reset DB
    db.drop_all()
    db.create_all()

    # Create users
    admin = User(username="admin", role="admin")
    admin.set_password("admin123")

    guard = User(username="guard", role="guard")
    guard.set_password("guard123")

    office = User(username="office", role="office")
    office.set_password("office123")

    db.session.add_all([admin, guard, office])
    db.session.commit()   #

    
    for _ in range(5):
        entry = VehicleEntry(
            number_plate=fake.license_plate(),
            owner_name=fake.name(),
            phone_number=fake.phone_number(),
            id_number=str(fake.random_int(min=10000000, max=99999999)),
            user_id=guard.id,    
            office_id=office.id    
        )
        db.session.add(entry)

    db.session.commit()
    print("Database seeded!")
