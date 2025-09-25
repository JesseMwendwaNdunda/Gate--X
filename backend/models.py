from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
bcrypt = Bcrypt()
ma = Marshmallow()



user_offices = db.Table(
    'user_offices',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('office_id', db.Integer, db.ForeignKey('office.id'), primary_key=True)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  

    vehicle_entries = db.relationship('VehicleEntry', backref='added_by', lazy=True)

    offices = db.relationship('Office', secondary=user_offices, backref='users')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Office(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    vehicle_entries = db.relationship('VehicleEntry', backref='office', lazy=True)

    def __repr__(self):
        return f"<Office {self.name}>"


class VehicleEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number_plate = db.Column(db.String(20), nullable=False)
    owner_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    id_number = db.Column(db.String(20), nullable=False)

    entry_time = db.Column(db.DateTime, server_default=db.func.now())
    check_out_time = db.Column(db.DateTime, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    office_id = db.Column(db.Integer, db.ForeignKey('office.id'), nullable=False)

    def check_out(self):
        """Mark vehicle as checked out by setting the current timestamp."""
        self.check_out_time = db.func.now()

    def __repr__(self):
        return f"<VehicleEntry {self.number_plate} by User {self.user_id}>"




class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_relationships = True
        load_instance = True
        exclude = ("password_hash",)


class OfficeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Office
        include_relationships = True
        load_instance = True


class VehicleEntrySchema(ma.SQLAlchemyAutoSchema):
    added_by = ma.Nested(UserSchema, only=("id", "username", "role"))
    office = ma.Nested(OfficeSchema, only=("id", "name"))

    class Meta:
        model = VehicleEntry
        include_fk = True
        load_instance = True
