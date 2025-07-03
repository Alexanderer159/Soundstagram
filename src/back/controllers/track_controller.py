from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from back.extensions import db
from back.models.track_model import Track
from back.models.project_model import Project
from back.models.user_model import User
from back.models.notification_model import NotificationType, Notification
from back.models.collaborator_model import Collaborator, CollaboratorStatus
from back.controllers.notification_controller import create_notification

track_api = Blueprint("track_api", __name__)

@track_api.route("/tracks", methods=["POST"])
@jwt_required()
def create_track():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    project = db.session.get(Project, data["project_id"])
    if not project:
        return jsonify({"msg": "Proyecto no encontrado"}), 404

    is_approved = project.owner_id == user_id

    new_track = Track(
        track_name=data["track_name"],
        instrument=data["instrument"],
        file_url=data["file_url"],
        description=data.get("description", ""),
        duration=data.get("duration", 0),
        is_approved=is_approved,
        project_id=project.id,
        uploader_id=user_id
    )

    db.session.add(new_track)
    
    if project.owner_id != user_id:
        create_notification(
            recipient_id=project.owner_id,
            notif_type=NotificationType.track_pending,
            message="Nueva track pendiente de aprobación.",
            project_id=project.id,
            track_id=new_track.id,
            sender_id=user_id
        )

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
    track.duration = data.get("duration", track.duration)
    track.is_approved = data.get("is_approved", track.is_approved)

    db.session.commit()
    return jsonify(track.serialize()), 200

@track_api.route("/tracks/<int:track_id>", methods=["DELETE"])
@jwt_required()
def delete_track(track_id):
    user_id = int(get_jwt_identity())
    track = db.session.get(Track, track_id)

    if not track:
        return jsonify({"msg": "Track no encontrado"}), 404

    if track.uploader_id != user_id or track.project.owner_id != user_id:
        return jsonify({"msg": "No autorizado para eliminar este track"}), 403

    db.session.delete(track)
    db.session.commit()
    return jsonify({"msg": "Track eliminado"}), 200

@track_api.route("/tracks/<int:track_id>/approve", methods=["PUT"])
@jwt_required()
def approve_track(track_id):
    user_id = int(get_jwt_identity())
    track = db.session.get(Track, track_id)

    if not track:
        return jsonify({"msg": "Track no encontrado"}), 404

    if track.project.owner_id != user_id:
        return jsonify({"msg": "No autorizado para aprobar este track"}), 403

    track.is_approved = True
    track.updated_at = datetime.utcnow()
    
    if track.uploader_id != user_id:
        create_notification(
            recipient_id=track.uploader_id,
            notif_type=NotificationType.track_approved,
            message="Tu track ha sido aprobada.",
            project_id=track.project_id,
            track_id=track.id,
            sender_id=user_id
        )


        collab = Collaborator.query.filter_by(
            project_id=track.project_id,
            user_id=track.uploader_id
        ).first()

        if not collab:
            collab = Collaborator(
                project_id=track.project_id,
                user_id=track.uploader_id,
                status=CollaboratorStatus.approved
            )
            db.session.add(collab)
        elif collab.status != CollaboratorStatus.approved:
            collab.status = CollaboratorStatus.approved

    db.session.commit()
    return jsonify(track.serialize()), 200
