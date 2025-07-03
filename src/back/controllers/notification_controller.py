from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from back.extensions import db
from back.models.notification_model import Notification

notification_api = Blueprint("notification_api", __name__)

def create_notification(
    recipient_id: int,
    notif_type: str,
    message: str,
    related_project_id: int = None,
    related_track_id: int = None,
    sender_id: int = None
):
    notif = Notification(
        recipient_id=recipient_id,
        type=notif_type,
        message=message,
        related_project_id=related_project_id,
        related_track_id=related_track_id,
        sender_id=sender_id
    )
    db.session.add(notif)
    db.session.commit()


@notification_api.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(recipient_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.serialize() for n in notifications]), 200

@notification_api.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_as_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"msg": "Notificación no encontrada"}), 404
    if notification.recipient_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    notification.is_read = True
    db.session.commit()
    return jsonify(notification.serialize()), 200

@notification_api.route("/notifications/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"msg": "Notificación no encontrada"}), 404
    if notification.recipient_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({"msg": "Notificación eliminada"}), 200
