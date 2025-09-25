from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_restful import Api
from models import db, bcrypt, ma
from routes import VehicleEntryListResource, VehicleEntryResource, SignupResource, LoginResource
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
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

# Setup Flask-RESTful API
api = Api(app)
api.add_resource(SignupResource, "/api/signup")
api.add_resource(LoginResource, "/api/login")
api.add_resource(VehicleEntryListResource, "/api/vehicle_entries")
api.add_resource(VehicleEntryResource, "/api/vehicle_entries/<int:entry_id>")

# Handle preflight OPTIONS requests globally
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        response.status_code = 200
        return response

if __name__ == "__main__":
    app.run(debug=True)
