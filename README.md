# Gate--X
A full-stack web application for managing vehicle entries and gate access, built with Flask backend API and a modern React frontend. This project demonstrates a real-world full-stack setup with RESTful APIs, JWT authentication, database migrations, and a frontend powered by modern tooling (React + Vite).

The link to the live and running site is:https://gate-x-7.onrender.com
Admin username: admin


Admin password: admin123

# Features
## Backend

 REST API with Flask-RESTful

 JWT Authentication (Flask-JWT-Extended)

 Database integration with SQLAlchemy

 Migrations handled by Flask-Migrate

 CORS enabled for cross-origin requests

 Configurable with .env

## Frontend

 Built with React (Vite)

 Vehicle entry management dashboard

 User login and role-based access (Admin/User)

 Interactive UI consuming backend API

Served as static files from frontend/dist/

# Quick Start
## Prerequisites
Python 3.8 +
Node.js 14 +


# Backend setup
git clone https://github.com/JesseMwendwaNdunda/Gate--X.git
cd Gate--X/backend

## Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

## Install dependencies
pip install -r requirements.txt

## Create .env file
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
DATABASE_URI=sqlite:///gatex.db

## Setup db and run
flask db upgrade
flask run

# Frontend setup
The frontend is built and served automatically from the frontend/dist folder. No separate setup required!

# API Endpoints
## Users

POST /api/register → Register new user

POST /api/login → Login and receive JWT

GET /api/profile → Get user details

## Vehicle Entries

GET /api/vehicle_entries → List all entries

POST /api/vehicle_entries → Add new entry

PUT /api/vehicle_entries/<id> → Update entry

DELETE /api/vehicle_entries/<id> → Delete entry

## Admin

GET /api/admin/vehicles → Admin-only view of all vehicles

# Development

API Docs available at /docs (if Swagger/RESTx enabled)

Database: SQLite (default) with Flask-Migrate for schema changes

Authentication: JWT tokens for secure API access

Frontend-Backend connection via CORS

# Deployment Ready 

The app is configured for production with:

Static file serving from built frontend

Environment-based configuration

Database migration system


