# back/routes/like_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from back.models.like_model import Like
from back.models.track_model import Track
from back.models.project_model import Project
from back.models.notification_model import NotificationType
from back.controllers.notification_controller import create_notification
from back.extensions import db

like_api = Blueprint('like_api', __name__)

@like_api.route('/likes/track/<int:track_id>', methods=['POST'])
@jwt_required()
def toggle_like(track_id):
    user_id = int(get_jwt_identity())

    existing_like = Like.query.filter_by(user_id=user_id, track_id=track_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"msg": "Like eliminado"}), 200
    else:
        new_like = Like(user_id=user_id, track_id=track_id)
        db.session.add(new_like)
        
        track = db.session.get(Track, track_id)
        if track and track.uploader_id != user_id:
            create_notification(
                recipient_id=track.uploader_id,
                notif_type=NotificationType.like,
                message="Alguien dio like a tu track.",
                track_id=track_id,
                sender_id=user_id
            )

            
        db.session.commit()
        return jsonify({"msg": "Like añadido"}), 201
    
@like_api.route('/likes/project/<int:project_id>', methods=['POST'])
@jwt_required()
def toggle_like_project(project_id):
    user_id = int(get_jwt_identity())

    existing_like = Like.query.filter_by(user_id=user_id, project_id=project_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"msg": "Like eliminado"}), 200
    else:
        new_like = Like(user_id=user_id, project_id=project_id)
        db.session.add(new_like)

        project = db.session.get(Project, project_id)
        if project and project.owner_id != user_id:
            create_notification(
                recipient_id=project.owner_id,
                notif_type=NotificationType.like,
                message="Alguien dio like a tu proyecto.",
                project_id=project_id,
                sender_id=user_id
            )


        db.session.commit()
        return jsonify({"msg": "Like añadido"}), 201
    
@like_api.route('/likes/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_likes(user_id):
    likes = Like.query.filter_by(user_id=user_id).all()
    return jsonify([like.serialize() for like in likes]), 200

@like_api.route('/likes/track/<int:track_id>', methods=['GET'])
def get_likes_for_track(track_id):
    likes = Like.query.filter_by(track_id=track_id).all()
    return jsonify([like.serialize() for like in likes]), 200

@like_api.route('/likes/project/<int:project_id>', methods=['GET'])
def get_likes_for_project(project_id):
    likes = Like.query.filter_by(project_id=project_id).all()
    return jsonify([like.serialize() for like in likes]), 200
