import json
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthapp.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

# Create database tables
with app.app_context():
    db.create_all()

# Routes

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    role = data['role']  # Capture role data

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    new_user = User()
    new_user.username = username
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    # Save role data to data.json
    user_data = {
        'username': username,
        'role': role
    }

    # Check if the data.json file exists, if not create it
    if not os.path.exists('data.json'):
        with open('data.json', 'w') as f:
            json.dump([user_data], f, indent=4)
    else:
        # Append new user data to the existing data.json
        with open('data.json', 'r+') as f:
            existing_data = json.load(f)
            existing_data.append(user_data)
            f.seek(0)
            json.dump(existing_data, f, indent=4)

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({'message': 'Logged in successfully', 'user_id': user.id, 'username': user.username}), 200

if __name__ == '__main__':
    app.run(debug=True)
