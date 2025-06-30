from flask import Blueprint, request, jsonify
from back.models.role_model import Role
from back.extensions import db
from sqlalchemy.exc import SQLAlchemyError

role_api = Blueprint("role_api", __name__)

@role_api.route("/roles", methods=["GET"])
def get_roles():
    roles = db.session.query(Role).all()
    return jsonify([role.serialize() for role in roles]), 200

@role_api.route("/roles", methods=["POST"])
def create_role():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    if Role.query.filter_by(name=name).first():
        return jsonify({"error": "Ese rol ya existe"}), 409

    role = Role(name=name)
    db.session.add(role)
    db.session.commit()
    return jsonify(role.serialize()), 201

@role_api.route("/roles/<int:role_id>", methods=["DELETE"])
def delete_role(role_id):
    role = db.session.get(Role, role_id)
    if not role:
        return jsonify({"error": "Rol no encontrado"}), 404

    try:
        db.session.delete(role)
        db.session.commit()
        return jsonify({"message": "Rol eliminado"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar el rol"}), 500
