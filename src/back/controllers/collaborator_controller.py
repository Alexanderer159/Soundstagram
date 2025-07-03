# back/routes/collaborator_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from back.models.collaborator_model import Collaborator
from back.extensions import db

collaborator_api = Blueprint("collaborator_api", __name__)

@collaborator_api.route("/projects/<int:project_id>/collaborators", methods=["GET"])
@jwt_required()
def get_collaborators(project_id):
    collaborators = Collaborator.query.filter_by(project_id=project_id).all()
    return jsonify([c.serialize() for c in collaborators]), 200
