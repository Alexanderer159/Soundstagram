from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from back.extensions import db
from back.models.project_model import Project, VisibilityEnum, StatusEnum
from back.models.user_model import User

project_api = Blueprint('project_api', __name__)

@project_api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        visibility = VisibilityEnum(data.get('visibility', 'public'))
        status = StatusEnum(data.get('status', 'active'))
    except ValueError:
        return jsonify({'msg': 'Valores de visibility o status no válidos'}), 400

    new_project = Project(
        title=data.get('title'),
        description=data.get('description'),
        genre=data.get('genre'),
        tags=data.get('tags'),
        visibility=visibility,
        status=status,
        owner_id=user_id
    )

    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.serialize()), 201

@project_api.route('/projects/public', methods=['GET'])
@jwt_required()
def get_all_public_projects():
    projects = Project.query.filter_by(visibility=VisibilityEnum.public).all()
    return jsonify([p.serialize() for p in projects]), 200

@project_api.route('/projects/user/<int:user_id>', methods=['GET'])
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
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404

    if user_id != project.owner_id:
        return jsonify({'msg': 'No autorizado para ver este proyecto'}), 403

    return jsonify(project.serialize()), 200

@project_api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'msg': 'Proyecto no encontrado'}), 404

    if project.owner_id != user_id:
        return jsonify({'msg': 'No autorizado para modificar este proyecto'}), 403

    data = request.get_json()

    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    project.genre = data.get('genre', project.genre)
    project.tags = data.get('tags', project.tags)

    project.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(project.serialize()), 200

@project_api.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, owner_id=user_id).first()

    if not project:
        return jsonify({'msg': 'Proyecto no encontrado o no autorizado'}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({'msg': 'Proyecto eliminado'}), 200
