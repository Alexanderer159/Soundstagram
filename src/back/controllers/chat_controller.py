from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from back.extensions import db
from back.models.chat_model import Chat, Message
from back.models.user_model import User
from back.controllers.notification_controller import create_notification

chat_api = Blueprint("chat_api", __name__)

@chat_api.route("/chats", methods=["GET"])
@jwt_required()
def get_user_chats():
    user_id = int(get_jwt_identity())
    chats = Chat.query.filter(
        db.or_(
            Chat.user1_id == user_id,
            Chat.user2_id == user_id
        )
    ).all()
    return jsonify([chat.serialize() for chat in chats]), 200


@chat_api.route("/chats/<int:chat_id>/messages", methods=["GET"])
@jwt_required()
def get_chat_messages(chat_id):
    user_id = int(get_jwt_identity())
    chat = db.session.get(Chat, chat_id)

    if not chat:
        return jsonify({"msg": "Chat no encontrado"}), 404
    if user_id not in [chat.user1_id, chat.user2_id]:
        return jsonify({"msg": "No tienes acceso a este chat"}), 403

    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp.asc()).all()
    return jsonify([m.serialize() for m in messages]), 200


@chat_api.route("/chats/<int:other_user_id>/messages", methods=["POST"])
@jwt_required()
def send_message_to_user(other_user_id):
    current_user_id = int(get_jwt_identity())

    if current_user_id == other_user_id:
        return jsonify({"msg": "No puedes enviarte mensajes a ti mismo"}), 400

    chat = Chat.query.filter(
        db.or_(
            db.and_(Chat.user1_id == current_user_id, Chat.user2_id == other_user_id),
            db.and_(Chat.user1_id == other_user_id, Chat.user2_id == current_user_id)
        )
    ).first()

    if not chat:
        chat = Chat(user1_id=current_user_id, user2_id=other_user_id)
        db.session.add(chat)
        db.session.commit()

    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"msg": "El contenido del mensaje es obligatorio"}), 400

    new_msg = Message(chat_id=chat.id, sender_id=current_user_id, content=content)
    
    create_notification(
        user_id=other_user_id,
        type="message",
        source_user_id=current_user_id,
        metadata={"chat_id": chat.id}
    )
    
    db.session.add(new_msg)
    db.session.commit()
    return jsonify(new_msg.serialize()), 201
