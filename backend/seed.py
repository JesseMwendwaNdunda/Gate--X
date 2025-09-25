from app import app, db
from models import User, VehicleEntry, Office
from faker import Faker
import random

fake = Faker()

with app.app_context():
    # Reset DB
    db.drop_all()
    db.create_all()

    # Create Admin
    admin = User(username="admin", role="admin")
    admin.set_password("admin123")

    # Create Guards
    guard_names = ["joe", "james", "paul", "mary", "lucy"]
    guards = []

    for name in guard_names:
        guard = User(username=f"guard_{name}", role="guard")
        guard.set_password("gate123")  
        guards.append(guard)

    db.session.add(admin)
    db.session.add_all(guards)
    db.session.commit()

    # Create offices
    offices = [
        Office(name="Moringa School"),
        Office(name="Lexing Kenya"),
        Office(name="Bima Finance"),
        Office(name="Gate-X Security Office")
    ]
    db.session.add_all(offices)
    db.session.commit()

    
    for guard in guards:
        assigned_offices = random.sample(offices, k=2)  
        guard.offices.extend(assigned_offices)
    db.session.commit()

    
    for guard in guards:
        for _ in range(5):  
            entry = VehicleEntry(
                number_plate=fake.license_plate(),
                owner_name=fake.name(),
                phone_number=fake.phone_number(),
                id_number=str(fake.random_int(min=10000000, max=99999999)),
                user_id=guard.id,
                office_id=random.choice(guard.offices).id  
            )
            db.session.add(entry)

    db.session.commit()
    print("Database seeded with admin, guards, offices, and vehicle entries!")
