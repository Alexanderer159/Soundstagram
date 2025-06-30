from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime

from back.extensions import db
from back.models.track_model import Track
from back.models.project_model import Project
from back.models.user_model import User

track_api = Blueprint("track_api", __name__)
CORS(track_api)

@track_api.route("/tracks", methods=["POST"])
@jwt_required()
def create_track():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    required_fields = ["project_id", "track_name", "instrument", "file_url"]
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    project = db.session.get(Project, data["project_id"])
    if not project:
        return jsonify({"msg": "Proyecto no encontrado"}), 404

    if project.owner_id != user_id:
        return jsonify({"msg": "No autorizado para añadir tracks"}), 403

    new_track = Track(
        track_name=data["track_name"],
        instrument=data["instrument"],
        file_url=data["file_url"],
        description=data.get("description", ""),
        project_id=data["project_id"],
        uploader_id=user_id
    )

    db.session.add(new_track)
    db.session.commit()
    return jsonify(new_track.serialize()), 201

@track_api.route("/projects/<int:project_id>/tracks", methods=["GET"])
@jwt_required()
def get_tracks_by_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"msg": "Proyecto no encontrado"}), 404



    tracks = Track.query.filter_by(project_id=project_id).all()
    return jsonify([track.serialize() for track in tracks]), 200

@track_api.route("/tracks/<int:track_id>", methods=["GET"])
@jwt_required()
def get_track_by_id(track_id):
    user_id = int(get_jwt_identity())
    track = db.session.get(Track, track_id)

    if not track:
        return jsonify({"msg": "Track no encontrado"}), 404

    if track.project.visibility.name == "private" and track.project.owner_id != user_id:
        return jsonify({"msg": "No autorizado para ver este track"}), 403

    return jsonify(track.serialize()), 200

@track_api.route('/users/<int:user_id>/tracks', methods=['GET'])
@jwt_required()
def get_tracks_by_user(user_id):
    current_user_id = int(get_jwt_identity())

    if user_id != current_user_id:
        return jsonify({'msg': 'No autorizado para ver los tracks de este usuario'}), 403

    tracks = Track.query.filter_by(uploader_id=user_id).all()
    return jsonify([t.serialize() for t in tracks]), 200

@track_api.route("/tracks/<int:track_id>", methods=["PUT"])
@jwt_required()
def update_track(track_id):
    user_id = int(get_jwt_identity())
    track = db.session.get(Track, track_id)

    if not track:
        return jsonify({"msg": "Track no encontrado"}), 404

    if track.uploader_id != user_id:
        return jsonify({"msg": "No autorizado para modificar este track"}), 403

    data = request.get_json()

    track.track_name = data.get("track_name", track.track_name)
    track.instrument = data.get("instrument", track.instrument)
    track.description = data.get("description", track.description)
    track.file_url = data.get("file_url", track.file_url)
    track.updated_at = datetime.utcnow()

    db.session.commit()
    return jsonify(track.serialize()), 200

@track_api.route("/tracks/<int:track_id>", methods=["DELETE"])
@jwt_required()
def delete_track(track_id):
    user_id = int(get_jwt_identity())
    track = db.session.get(Track, track_id)

    if not track:
        return jsonify({"msg": "Track no encontrado"}), 404

    if track.uploader_id != user_id and track.project.owner_id != user_id:
        return jsonify({"msg": "No autorizado para eliminar este track"}), 403

    db.session.delete(track)
    db.session.commit()
    return jsonify({"msg": "Track eliminado"}), 200