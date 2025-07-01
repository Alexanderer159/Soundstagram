from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from back.extensions import db
from back.models.genre_model import Genre

genre_api = Blueprint("genre_api", __name__)

@genre_api.route("/genres", methods=["POST"])
# @jwt_required()
def create_genre():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"msg": "El nombre del género es obligatorio"}), 400

    if Genre.query.filter_by(name=name).first():
        return jsonify({"msg": "Ese género ya existe"}), 400

    new_genre = Genre(name=name)
    db.session.add(new_genre)
    db.session.commit()
    return jsonify(new_genre.serialize()), 201

@genre_api.route("/genres", methods=["GET"])
# @jwt_required()
def get_all_genres():
    genres = Genre.query.all()
    return jsonify([g.serialize() for g in genres]), 200

@genre_api.route("/genres/<int:genre_id>", methods=["GET"])
# @jwt_required()
def get_genre_by_id(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        return jsonify({"msg": "Género no encontrado"}), 404
    return jsonify(genre.serialize()), 200

@genre_api.route("/genres/<int:genre_id>", methods=["PUT"])
# @jwt_required()
def update_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        return jsonify({"msg": "Género no encontrado"}), 404

    data = request.get_json()
    new_name = data.get("name")
    if not new_name:
        return jsonify({"msg": "El nombre es obligatorio"}), 400

    if Genre.query.filter(Genre.name == new_name, Genre.id != genre_id).first():
        return jsonify({"msg": "Ya existe otro género con ese nombre"}), 400

    genre.name = new_name
    db.session.commit()
    return jsonify(genre.serialize()), 200

@genre_api.route("/genres/<int:genre_id>", methods=["DELETE"])
# @jwt_required()
def delete_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        return jsonify({"msg": "Género no encontrado"}), 404

    db.session.delete(genre)
    db.session.commit()
    return jsonify({"msg": "Género eliminado"}), 200
