from flask import Blueprint, request, jsonify
from models import db, User, VehicleEntry, UserSchema, VehicleEntrySchema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)

user_schema = UserSchema()
vehicle_entry_schema = VehicleEntrySchema()
vehicle_entries_schema = VehicleEntrySchema(many=True)
# Signup

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already exists"}), 400

    new_user = User(username=data["username"], role=data["role"])
    new_user.set_password(data["password"])  

    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user), 201

# Login

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()

    if user and user.check_password(data["password"]): 
        access_token = create_access_token(identity={"id": user.id, "role": user.role})
        return jsonify({"token": access_token, "role": user.role}), 200

    return jsonify({"message": "Invalid credentials"}), 401



# Vehicle Entries

@auth_bp.route("/vehicle_entries", methods=["GET", "POST", "OPTIONS"])
@jwt_required(optional=True)   
def vehicle_entries():
    if request.method == "OPTIONS":
        
        return jsonify({"message": "CORS preflight passed"}), 200

    if request.method == "POST":
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({"message": "Authentication required"}), 401

        data = request.get_json()
        new_entry = VehicleEntry(
            number_plate=data["number_plate"],
            owner_name=data["owner_name"],
            phone_number=data["phone_number"],
            id_number=data["id_number"],
            office=data["office"],
            user_id=current_user["id"]
        )
        db.session.add(new_entry)
        db.session.commit()
        return vehicle_entry_schema.jsonify(new_entry), 201

    # GET
    entries = VehicleEntry.query.all()
    return vehicle_entries_schema.jsonify(entries), 200