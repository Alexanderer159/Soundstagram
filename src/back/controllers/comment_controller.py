# back/routes/comment_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from back.extensions import db
from back.models.comment_model import Comment
from back.models.notification_model import NotificationType
from back.controllers.notification_controller import create_notification

comment_api = Blueprint('comment_api', __name__)

@comment_api.route('/comments', methods=['POST'])
@jwt_required()
def create_comment():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    content = data.get("content")
    track_id = data.get("track_id")
    project_id = data.get("project_id")

    if not content:
        return jsonify({"msg": "Falta el contenido del comentario"}), 400

    if not track_id and not project_id:
        return jsonify({"msg": "Debes especificar un track_id o un project_id"}), 400

    if track_id and project_id:
        return jsonify({"msg": "Solo se puede comentar en un track o en un proyecto, no ambos"}), 400

    comment = Comment(
        content=content,
        track_id=track_id,
        project_id=project_id,
        author_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(comment)
    
    if project_id:
        from back.models.project_model import Project
        project = db.session.get(Project, project_id)
        if project and user_id != project.owner_id:
            create_notification(
                recipient_id=project.owner_id,
                notif_type=NotificationType.comment,
                message="Han comentado en tu proyecto.",
                project_id=project.id,
                sender_id=user_id
            )

    elif track_id:
        from back.models.track_model import Track
        track = db.session.get(Track, track_id)
        if track and user_id != track.uploader_id:
            create_notification(
                recipient_id=track.uploader_id,
                notif_type=NotificationType.comment,
                message="Han comentado en tu track.",
                track_id=track.id,
                sender_id=user_id
            )
            
    db.session.commit()
    return jsonify(comment.serialize()), 201


@comment_api.route('/comments/track/<int:track_id>', methods=['GET'])
def get_comments_for_track(track_id):
    comments = Comment.query.filter_by(track_id=track_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.serialize() for c in comments]), 200


@comment_api.route('/comments/project/<int:project_id>', methods=['GET'])
def get_comments_for_project(project_id):
    comments = Comment.query.filter_by(project_id=project_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.serialize() for c in comments]), 200


@comment_api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"msg": "Comentario no encontrado"}), 404

    if comment.author_id != user_id:
        return jsonify({"msg": "No autorizado para borrar este comentario"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"msg": "Comentario eliminado"}), 200
