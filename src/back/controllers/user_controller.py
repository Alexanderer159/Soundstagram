from flask import Blueprint, request, jsonify
from back.models.user_model import User
from back.models.role_model import Role
from back.models.instrument_model import Instrument
from back.extensions import db
from sqlalchemy.exc import SQLAlchemyError

user_api = Blueprint("user_api", __name__)

@user_api.route("/users", methods=["GET"])
def get_all_users():
    users = db.session.query(User).all()
    return jsonify([user.serialize() for user in users]), 200


@user_api.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if user:
        return jsonify(user.serialize()), 200
    return jsonify({"error": "Usuario no encontrado"}), 404


@user_api.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = User(
        username=data.get("username"),
        email=data.get("email"),
        password_hash=data.get("password_hash"),
        bio=data.get("bio"),
        profile_pic_url=data.get("profile_pic_url"),
        spotify_playlist=data.get("spotify_playlist"),
    )

    role_ids = data.get("role_ids", [])
    instrument_ids = data.get("instrument_ids", [])

    if role_ids:
        user.roles = Role.query.filter(Role.id.in_(role_ids)).all()
    if instrument_ids:
        user.instruments = Instrument.query.filter(Instrument.id.in_(instrument_ids)).all()

    db.session.add(user)
    db.session.commit()
    return jsonify(user.serialize()), 201


@user_api.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.bio = data.get("bio", user.bio)
    user.profile_pic_url = data.get("profile_pic_url", user.profile_pic_url)
    user.spotify_playlist = data.get("spotify_playlist", user.spotify_playlist)

    role_ids = data.get("role_ids")
    instrument_ids = data.get("instrument_ids")

    if role_ids is not None:
        user.roles = Role.query.filter(Role.id.in_(role_ids)).all()
    if instrument_ids is not None:
        user.instruments = Instrument.query.filter(Instrument.id.in_(instrument_ids)).all()

    db.session.commit()
    return jsonify(user.serialize()), 200


@user_api.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Usuario eliminado correctamente"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar usuario"}), 500

@user_api.route("/users/role/<int:role_id>", methods=["GET"])
def get_users_by_role(role_id):
    role = db.session.get(Role, role_id)
    if not role:
        return jsonify({"error": "Rol no encontrado"}), 404

    return jsonify([user.serialize() for user in role.users]), 200

@user_api.route("/users/instrument/<int:instrument_id>", methods=["GET"])
def get_users_by_instrument(instrument_id):
    instrument = db.session.get(Instrument, instrument_id)
    if not instrument:
        return jsonify({"error": "Instrumento no encontrado"}), 404

    return jsonify([user.serialize() for user in instrument.users]), 200

