from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from back.models.genre_model import Genre
from back.extensions import db
from back.models.project_model import Project, VisibilityEnum, StatusEnum, KeyEnum, MeterEnum
from back.models.role_model import Role
from back.models.instrument_model import Instrument
from back.models.genre_model import project_genres
from back.models.user_model import User

project_api = Blueprint('project_api', __name__)

@project_api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        project = Project(
            title=data["title"],
            description=data.get("description"),
            tags=data.get("tags"),
            key=KeyEnum(data["key"]) if data.get("key") else None,
            meter=MeterEnum(data["meter"]) if data.get("meter") else None,
            bpm=int(data["bpm"]) if data.get("bpm") else None,
            visibility=VisibilityEnum(data["visibility"]),
            status=StatusEnum(data["status"]),
            owner_id=user_id
        )

        genre_ids = data.get("genre_ids", [])
        if genre_ids:
            genres = Genre.query.filter(Genre.id.in_(genre_ids)).all()
            project.genres = genres

        role_ids = data.get("seeking_role_ids", [])
        if role_ids:
            roles = Role.query.filter(Role.id.in_(role_ids)).all()
            project.seeking_roles = roles

        instrument_ids = data.get("seeking_instrument_ids", [])
        if instrument_ids:
            instruments = Instrument.query.filter(Instrument.id.in_(instrument_ids)).all()
            project.seeking_instruments = instruments

        db.session.add(project)
        db.session.commit()

        return jsonify(project.serialize()), 201

    except (ValueError, KeyError) as e:
        return jsonify({"msg": f"Error de validación: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error interno: {str(e)}"}), 500

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

    if user_id != project.owner_id and project.visibility != VisibilityEnum.public:
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
    project.tags = data.get('tags', project.tags)

    if 'key' in data:
        try:
            project.key = KeyEnum(data['key']) if data['key'] else None
        except ValueError:
            return jsonify({'msg': 'Key inválido'}), 400

    if 'meter' in data:
        try:
            project.meter = MeterEnum(data['meter']) if data['meter'] else None
        except ValueError:
            return jsonify({'msg': 'Meter inválido'}), 400

    if 'bpm' in data:
        try:
            project.bpm = int(data['bpm']) if data['bpm'] is not None else None
        except ValueError:
            return jsonify({'msg': 'BPM debe ser un número'}), 400

    genre_ids = data.get('genres')
    if genre_ids is not None:
        genres = Genre.query.filter(Genre.id.in_(genre_ids)).all()
        project.genres = genres

    role_ids = data.get('seeking_role_ids')
    if role_ids is not None:
        roles = Role.query.filter(Role.id.in_(role_ids)).all()
        project.seeking_roles = roles

    instrument_ids = data.get('seeking_instrument_ids')
    if instrument_ids is not None:
        instruments = Instrument.query.filter(Instrument.id.in_(instrument_ids)).all()
        project.seeking_instruments = instruments

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

@project_api.route("/projects/seeking-instrument/<int:instrument_id>", methods=["GET"])
def get_projects_by_seeking_instrument(instrument_id):
    projects = Project.query.filter(
        Project.seeking_instruments.any(id=instrument_id),
        Project.visibility == VisibilityEnum.public
    ).all()

    return jsonify([p.serialize() for p in projects]), 200

@project_api.route("/projects/seeking-role/<int:role_id>", methods=["GET"])
def get_projects_by_seeking_role(role_id):
    projects = Project.query.filter(
        Project.seeking_roles.any(id=role_id),
        Project.visibility == VisibilityEnum.public
    ).all()

    return jsonify([p.serialize() for p in projects]), 200

@project_api.route("/projects/by-genre/<int:genre_id>", methods=["GET"])
def get_projects_by_genre(genre_id):
    projects = db.session.query(Project).join(project_genres).filter(project_genres.c.genre_id == genre_id).all()
    return jsonify([p.serialize() for p in projects]), 200

@project_api.route('/projects/followed/<int:user_id>', methods=['GET'])
@jwt_required()
def get_projects_from_followed_users(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    followed_ids = [f.followed_id for f in user.following]
    projects = Project.query.filter(
        Project.owner_id.in_(followed_ids),
        Project.visibility == VisibilityEnum.public
    ).all()
    return jsonify([p.serialize() for p in projects]), 200
