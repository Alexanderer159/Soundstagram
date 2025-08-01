from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token
from datetime import datetime
import re
from back.extensions import db, bcrypt
from back.models.user_model import User
from sqlalchemy.exc import IntegrityError
from back.models.role_model import Role
from back.models.instrument_model import Instrument

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not email or not password:
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'msg': 'Correo electrónico inválido'}), 400

    if len(password) < 8 or not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return jsonify({'msg': 'La contraseña debe tener al menos 8 caracteres e incluir letras y números'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'El correo ya está registrado'}), 400

    if username and User.query.filter_by(username=username).first():
        return jsonify({'msg': 'El nombre de usuario ya está en uso'}), 400

    bio = data.get('bio')
    role_ids = data.get('roles', [])
    instrument_ids = data.get('instruments', [])
    profile_pic_url = data.get('profile_pic_url')
    spotify_playlist = data.get('spotify_playlist')

    if not isinstance(role_ids, list) or not all(isinstance(r, (int, str)) for r in role_ids):
        return jsonify({'msg': 'El campo roles debe ser una lista de enteros o strings'}), 400

    if not isinstance(instrument_ids, list) or not all(isinstance(i, (int, str)) for i in instrument_ids):
        return jsonify({'msg': 'El campo instruments debe ser una lista de enteros o strings'}), 400

    if spotify_playlist and not spotify_playlist.startswith("https://open.spotify.com/"):
        return jsonify({'msg': 'Enlace de playlist no válido'}), 400

    roles = Role.query.filter(Role.id.in_(role_ids)).all() if role_ids else []
    instruments = Instrument.query.filter(Instrument.id.in_(instrument_ids)).all() if instrument_ids else []

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        email=email,
        password_hash=hashed_password,
        username=username or email.split('@')[0],
        bio=bio,
        roles=roles,
        instruments=instruments,
        profile_pic_url=profile_pic_url,
        spotify_playlist=spotify_playlist,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'msg': 'Error al crear usuario. Verifica los campos únicos'}), 400

    return jsonify({'msg': 'Usuario creado correctamente'}), 201

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


    token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': token,
        'user': user.serialize()
    }), 200
