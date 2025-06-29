# """
# This module takes care of starting the API Server, Loading the DB and Adding the endpoints
# """
# from flask import Flask, request, jsonify, url_for, Blueprint
# from back.models.user_model import db, User
# from back.utils import generate_sitemap, APIException
# from flask_cors import CORS
# from flask_jwt_extended import create_access_token
# from back.extensions import bcrypt, jwt
# from datetime import datetime

# api = Blueprint('api', __name__)

# CORS(api)

# @api.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')
#     username = data.get('username')  

#     if not email or not password:
#         return jsonify({'msg': 'Faltan campos obligatorios'}), 400

#     if User.query.filter_by(email=email).first():
#         return jsonify({'msg': 'El correo ya está registrado'}), 400

#     hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

#     new_user = User(
#         email=email,
#         password_hash=hashed_password,
#         username=username or email.split('@')[0],
#         is_active=True,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow()
#     )

#     db.session.add(new_user)
#     db.session.commit()

#     return jsonify({'msg': 'Usuario creado correctamente'}), 201

# @api.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     if not email or not password:
#         return jsonify({'msg': 'Faltan campos obligatorios'}), 400

#     user = User.query.filter_by(email=email).first()

#     if not user or not bcrypt.check_password_hash(user.password_hash, password):
#         return jsonify({'msg': 'Credenciales inválidas'}), 401

#     token = create_access_token(identity=str(user.id))
#     return jsonify({'access_token': token}), 200