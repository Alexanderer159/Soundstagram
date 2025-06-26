from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from back.models.project_model import db, Project, VisibilityEnum, StatusEnum
from back.models.user_model import User
from datetime import datetime

project_api = Blueprint('project_api', __name__)

CORS(project_api)

@project_api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    new_project = Project(
        title=data.get('title'),
        description=data.get('description'),
        genre=data.get('genre'),
        tags=data.get('tags'),
        visibility=data.get('visibility', 'public'), 
        status=data.get('status', 'active'), 
        owner_id=user_id
    )

    db.session.add(new_project)
    db.session.commit()

    return jsonify(new_project.serialize()), 201

@project_api.route('/projects', methods=['GET'])
@jwt_required()
def get_all_public_projects():
    projects = Project.query.filter_by(visibility=VisibilityEnum.public).all()
    return jsonify([p.serialize() for p in projects]), 200

@project_api.route('/projects/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_projects(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    projects = Project.query.filter_by(owner_id=user_id).all()
    return jsonify([p.serialize() for p in projects]), 200


@project_api.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project_by_id(project_id):
    project = Project.query.filter_by(id=project_id).first()
    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404
    return jsonify(project.serialize()), 200



@project_api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id).first()
    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404

    if project.owner_id != user_id:
        return jsonify({'msg': 'No autorizado para modificar este proyecto'}), 403

    data = request.get_json()

    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    project.genre = data.get('genre', project.genre)
    project.tags = data.get('tags', project.tags)

    visibility = data.get('visibility')
    if visibility:
        try:
            project.visibility = VisibilityEnum(visibility)
        except ValueError:
            return jsonify({'msg': 'Valor de visibility no válido'}), 400

    status = data.get('status')
    if status:
        try:
            project.status = StatusEnum(status)
        except ValueError:
            return jsonify({'msg': 'Valor de status no válido'}), 400

    project.updated_at = datetime.utcnow()
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
