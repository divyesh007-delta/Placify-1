from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import os

from routes.analysis import analysis_bp  # Add this import
from routes.auth import auth_bp
from routes.companies import companies_bp
from routes.experiences import experiences_bp
from routes.admin import admin_bp  # Add this import

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))  # default 15 min
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = int(
    os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))  # default 7 days

jwt = JWTManager(app)

# MongoDB Config
mongo_uri = os.getenv("MONGO_URI")
mongo_db_name = os.getenv("MONGO_DB_NAME", "placify-final-db")

client = MongoClient(mongo_uri)
app.config["MONGO_DB"] = client[mongo_db_name]

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(companies_bp, url_prefix='/api')
app.register_blueprint(experiences_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')  # Add this line
app.register_blueprint(analysis_bp, url_prefix='/api')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
