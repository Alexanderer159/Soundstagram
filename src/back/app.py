"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from back.utils import APIException, generate_sitemap
from back.extensions import db, bcrypt, jwt
from back.auth.auth import auth_api
from back.controllers.project_controller import project_api
from back.controllers.track_controller import track_api
from back.controllers.user_controller import user_api
from back.controllers.role_controller import role_api
from back.controllers.instrument_controller import instrument_api
from back.admin import setup_admin
from back.commands import setup_commands

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
bcrypt.init_app(app)
jwt.init_app(app)


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'test.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type=True)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(user_api, url_prefix='/api')
app.register_blueprint(project_api, url_prefix='/api')
app.register_blueprint(auth_api, url_prefix='/api')
app.register_blueprint(track_api, url_prefix='/api')
app.register_blueprint(role_api, url_prefix='/api')
app.register_blueprint(instrument_api, url_prefix='/api')
# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)