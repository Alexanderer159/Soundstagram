from flask import Blueprint, request, jsonify
from back.models.user_model import User
from back.models.project_model import Project

search_api = Blueprint("search_api", __name__)

@search_api.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"msg": "Debes proporcionar un término de búsqueda"}), 400

    users = User.query.filter(User.username.ilike(f"%{query}%")).all()
    projects = Project.query.filter(Project.name.ilike(f"%{query}%")).all()

    return jsonify({
        "users": [u.serialize() for u in users],
        "projects": [p.serialize() for p in projects]
    }), 200
