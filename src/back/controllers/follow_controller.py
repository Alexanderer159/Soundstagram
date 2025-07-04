# back/routes/follow_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from back.models.follow_model import Follow
from back.models.user_model import User
from back.controllers.notification_controller import create_notification
from back.extensions import db

follow_api = Blueprint('follow_api', __name__)

@follow_api.route('/follow/<int:user_id>', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = int(get_jwt_identity())

    if current_user_id == user_id:
        return jsonify({'msg': 'No puedes seguirte a ti mismo'}), 400

    existing = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'msg': 'Dejaste de seguir'}), 200

    follow = Follow(follower_id=current_user_id, followed_id=user_id)
    db.session.add(follow)
    db.session.commit()

    create_notification(
        recipient_id=user_id,
        notif_type="follow",
        message="Alguien ha comenzado a seguirte.",
        sender_id=current_user_id
    )


    return jsonify({'msg': 'Ahora sigues al usuario'}), 201

@follow_api.route('/followers/<int:user_id>', methods=['GET'])
@jwt_required()
def get_followers(user_id):
    followers = Follow.query.filter_by(followed_id=user_id).all()
    return jsonify([f.serialize() for f in followers]), 200

@follow_api.route('/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    following = Follow.query.filter_by(follower_id=user_id).all()
    return jsonify([f.serialize() for f in following]), 200

