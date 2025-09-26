from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_migrate import Migrate
from flask_restful import Api, Resource
from models import db, bcrypt, ma, VehicleEntry, VehicleEntrySchema, UserSchema, User, Office
from datetime import timedelta

# --------------------------
# Initialize Flask App
# --------------------------
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///gatex.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key-123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# --------------------------
# Initialize extensions
# --------------------------
db.init_app(app)
bcrypt.init_app(app)
ma.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Enable CORS for all /api/* routes
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# --------------------------
# Schemas
# --------------------------
vehicle_entry_schema = VehicleEntrySchema()
vehicle_entries_schema = VehicleEntrySchema(many=True)
user_schema = UserSchema()

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
        entry = VehicleEntry.query.get_or_404(entry_id)
        entry.check_out_time = db.func.now()
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

# --------------------------
# Setup Flask-RESTful API
# --------------------------
api = Api(app)
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
# Handle preflight OPTIONS requests globally
# --------------------------
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        response.status_code = 200
        return response

# --------------------------
# Run App
# --------------------------
if __name__ == "__main__":
    app.run(debug=True)
