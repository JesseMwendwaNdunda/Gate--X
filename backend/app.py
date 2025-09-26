from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_migrate import Migrate
from flask_restful import Api, Resource
from models import db, bcrypt, ma, VehicleEntry, VehicleEntrySchema, UserSchema, User, Office
from datetime import datetime

# --------------------------
# Initialize Flask App
# --------------------------
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./gatex.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "54524c30f406c0e194aaffc2102efd9a"

db.init_app(app)
bcrypt.init_app(app)
ma.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
api = Api(app)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# --------------------------
# Schemas
# --------------------------
vehicle_entry_schema = VehicleEntrySchema()
vehicle_entries_schema = VehicleEntrySchema(many=True)
user_schema = UserSchema()

# --------------------------
# Helpers
# --------------------------
def get_current_user():
    current_identity = get_jwt_identity()
    if not current_identity:
        return None, {"message": "Unauthorized"}, 401
    user = User.query.get(current_identity["id"])
    if not user:
        return None, {"message": "Unauthorized"}, 401
    return user, None, None

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        user, err, code = get_current_user()
        if err:
            return err, code
        if user.role != "admin":
            return {"message": "Admin access required"}, 403
        return fn(*args, **kwargs)
    return wrapper

# --------------------------
# Resources
# --------------------------
class SignupResource(Resource):
    def post(self):
        data = request.get_json()
        if User.query.filter_by(username=data["username"]).first():
            return {"message": "Username already exists"}, 400
        new_user = User(username=data["username"], role=data["role"])
        new_user.set_password(data["password"])
        db.session.add(new_user)
        db.session.commit()
        return user_schema.dump(new_user), 201

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data.get("username")).first()
        if user and user.check_password(data.get("password")):
            access_token = create_access_token(identity={
                "id": user.id,
                "role": user.role,
                "username": user.username
            })
            return {
                "token": access_token,
                "role": user.role,
                "username": user.username
            }, 200
        return {"message": "Invalid credentials"}, 401

class VehicleEntryListResource(Resource):
    @jwt_required()
    def get(self):
        user, err, code = get_current_user()
        if err:
            return err, code
        if user.role == "admin":
            entries = VehicleEntry.query.all()
        else:
            entries = VehicleEntry.query.filter_by(user_id=user.id).all()
        return vehicle_entries_schema.dump(entries), 200

    @jwt_required()
    def post(self):
        user, err, code = get_current_user()
        if err:
            return err, code

        data = request.get_json()
        required_fields = ["number_plate", "owner_name", "phone_number", "id_number", "office_id"]
        for field in required_fields:
            if field not in data:
                return {"message": f"{field} is required"}, 400

        new_entry = VehicleEntry(
            number_plate=data["number_plate"],
            owner_name=data["owner_name"],
            phone_number=data["phone_number"],
            id_number=data["id_number"],
            office_id=int(data["office_id"]),
            user_id=user.id
        )
        db.session.add(new_entry)
        db.session.commit()
        return vehicle_entry_schema.dump(new_entry), 201

class VehicleEntryResource(Resource):
    @jwt_required()
    def get(self, entry_id):
        VehicleEntry.query.get_or_404(entry_id)
        entry = VehicleEntry.query.get_or_404(entry_id)
        return vehicle_entry_schema.dump(entry), 200

    @admin_required
    def put(self, entry_id):
        entry = VehicleEntry.query.get_or_404(entry_id)
        data = request.get_json()
        for field in ["number_plate", "owner_name", "phone_number", "id_number", "office_id"]:
            if field in data:
                setattr(entry, field, int(data[field]) if field == "office_id" else data[field])
        db.session.commit()
        return vehicle_entry_schema.dump(entry), 200

    @jwt_required()
    def patch(self, entry_id):
        entry = VehicleEntry.query.get_or_404(entry_id)
        entry.check_out_time = datetime.utcnow()
        db.session.commit()
        return vehicle_entry_schema.dump(entry), 200

    @admin_required
    def delete(self, entry_id):
        entry = VehicleEntry.query.get_or_404(entry_id)
        db.session.delete(entry)
        db.session.commit()
        return {"message": "Entry deleted successfully"}, 200

# --------------------------
# Setup Flask-RESTful API
# --------------------------
api.add_resource(SignupResource, "/api/signup")
api.add_resource(LoginResource, "/api/login")
api.add_resource(VehicleEntryListResource, "/api/vehicle_entries")
api.add_resource(VehicleEntryResource, "/api/vehicle_entries/<int:entry_id>")

# --------------------------
# Create tables
# --------------------------
with app.app_context():
    db.create_all()

# --------------------------
# Run App
# --------------------------
if __name__ == "__main__":
    app.run(debug=True)
