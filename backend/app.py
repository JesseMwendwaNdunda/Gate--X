from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate   
from models import db, bcrypt, ma
from routes import auth_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
ma.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)


migrate = Migrate(app, db)

app.register_blueprint(auth_bp, url_prefix='/api')



if __name__ == '__main__':
    app.run(debug=True)
