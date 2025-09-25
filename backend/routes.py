from flask import Flask, request
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from models import db, VehicleEntry, VehicleEntrySchema, UserSchema, User
from datetime import timedelta

vehicle_entry_schema = VehicleEntrySchema()
vehicle_entries_schema = VehicleEntrySchema(many=True)
user_schema = UserSchema()

app = Flask(__name__)
api = Api(app)

# Config

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key-123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# Initialize extensions

db.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Resources

class VehicleEntryListResource(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user["role"] == "admin":
            entries = VehicleEntry.query.all()
        else:
            entries = VehicleEntry.query.filter_by(user_id=current_user["id"]).all()
        return vehicle_entries_schema.dump(entries), 200

    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        data = request.get_json()
        new_entry = VehicleEntry(
            number_plate=data["number_plate"],
            owner_name=data["owner_name"],
            phone_number=data["phone_number"],
            id_number=data["id_number"],
            office_id=int(data["office_id"]),
            user_id=current_user["id"]
        )
        db.session.add(new_entry)
        db.session.commit()
        return vehicle_entry_schema.dump(new_entry), 201

class VehicleEntryResource(Resource):
    @jwt_required()
    def get(self, entry_id):
        entry = VehicleEntry.query.get_or_404(entry_id)
        return vehicle_entry_schema.dump(entry), 200

    @jwt_required()
    def put(self, entry_id):
        current_user = get_jwt_identity()
        if current_user["role"] != "admin":
            return {"message": "Unauthorized - Admins only"}, 403
        entry = VehicleEntry.query.get_or_404(entry_id)
        data = request.get_json()
        for field in ["number_plate", "owner_name", "phone_number", "id_number", "office_id"]:
            if field in data:
                setattr(entry, field, int(data[field]) if field == "office_id" else data[field])
        db.session.commit()
        return vehicle_entry_schema.dump(entry), 200

    @jwt_required()
    def patch(self, entry_id):
        """Used for checkout (guard/admin)"""
        entry = VehicleEntry.query.get_or_404(entry_id)
        entry.check_out_time = db.func.now()  # automatically set timestamp
        db.session.commit()
        return vehicle_entry_schema.dump(entry), 200

    @jwt_required()
    def delete(self, entry_id):
        current_user = get_jwt_identity()
        if current_user["role"] != "admin":
            return {"message": "Unauthorized - Admins only"}, 403
        entry = VehicleEntry.query.get_or_404(entry_id)
        db.session.delete(entry)
        db.session.commit()
        return {"message": "Entry deleted successfully"}, 200

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
        user = User.query.filter_by(username=data["username"]).first()
        if user and user.check_password(data["password"]):
            access_token = create_access_token(
                identity={"id": user.id, "role": user.role, "username": user.username}
            )
            return {"token": access_token, "role": user.role, "username": user.username}, 200
        return {"message": "Invalid credentials"}, 401


api.add_resource(SignupResource, "/api/signup")
api.add_resource(LoginResource, "/api/login")
api.add_resource(VehicleEntryListResource, "/api/vehicle_entries")
api.add_resource(VehicleEntryResource, "/api/vehicle_entries/<int:entry_id>")


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
