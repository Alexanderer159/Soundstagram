from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token
from flask_cors import CORS
from datetime import datetime
import re

from back.extensions import db, bcrypt
from back.models.user_model import User

auth_api = Blueprint('auth_api', __name__)
CORS(auth_api)

# 📝 Endpoint: Registro de usuario
@auth_api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    # Validaciones básicas
    if not email or not password:
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'msg': 'Correo electrónico inválido'}), 400

    if len(password) < 6:
        return jsonify({'msg': 'La contraseña debe tener al menos 6 caracteres'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'El correo ya está registrado'}), 400

    # Crear usuario
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        email=email,
        password_hash=hashed_password,
        username=username or email.split('@')[0],
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'Usuario creado correctamente'}), 201

# 🔐 Endpoint: Login de usuario
@auth_api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'msg': 'Credenciales inválidas'}), 401

    if not user.is_active:
        return jsonify({'msg': 'Cuenta desactivada'}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': token,
        'user': user.serialize_public()
    }), 200
