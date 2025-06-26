from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from back.models.project_model import db, Project
from back.models.user_model import User

project_api = Blueprint('project_api', __name__)

@project_api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(owner_id=user_id).all()
    return jsonify([p.serialize() for p in projects]), 200

@project_api.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, owner_id=user_id).first()
    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404
    return jsonify(project.serialize()), 200

@project_api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get('title')
    description = data.get('description')

    if not title:
        return jsonify({'msg': 'El título es obligatorio'}), 400

    new_project = Project(
        title=title,
        description=description,
        owner_id=user_id
    )

    db.session.add(new_project)
    db.session.commit()

    return jsonify(new_project.serialize()), 201

@project_api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, owner_id=user_id).first()
    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404

    data = request.get_json()
    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)

    db.session.commit()
    return jsonify(project.serialize()), 200

@project_api.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, owner_id=user_id).first()
    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({'msg': 'Proyecto eliminado'}), 200
