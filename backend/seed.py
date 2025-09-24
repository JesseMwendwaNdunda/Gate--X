from app import app, db
from models import User, VehicleEntry
from faker import Faker
import random

fake = Faker()

with app.app_context():
    db.drop_all()
    db.create_all()

    
    admin = User(username="admin", role="admin")
    admin.set_password("admin123")

    guard = User(username="guard", role="guard")
    guard.set_password("guard123")

    office = User(username="office", role="office")
    office.set_password("office123")

    db.session.add_all([admin, guard, office])

   
    for _ in range(5):
        entry = VehicleEntry(
            number_plate=fake.license_plate(),
            owner_name=fake.name(),
            phone_number=fake.phone_number()
        )
        db.session.add(entry)

    db.session.commit()
    print("Database seeded!")
