from flask import Blueprint, request, jsonify
from back.models.instrument_model import Instrument
from back.extensions import db
from sqlalchemy.exc import SQLAlchemyError

instrument_api = Blueprint("instrument_api", __name__)

@instrument_api.route("/instruments", methods=["GET"])
def get_instruments():
    instruments = db.session.query(Instrument).all()
    return jsonify([instr.serialize() for instr in instruments]), 200

@instrument_api.route("/instruments", methods=["POST"])
def create_instrument():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    if Instrument.query.filter_by(name=name).first():
        return jsonify({"error": "Ese instrumento ya existe"}), 409

    instrument = Instrument(name=name)
    db.session.add(instrument)
    db.session.commit()
    return jsonify(instrument.serialize()), 201

@instrument_api.route("/instruments/<int:instrument_id>", methods=["DELETE"])
def delete_instrument(instrument_id):
    instrument = db.session.get(Instrument, instrument_id)
    if not instrument:
        return jsonify({"error": "Instrumento no encontrado"}), 404

    try:
        db.session.delete(instrument)
        db.session.commit()
        return jsonify({"message": "Instrumento eliminado"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar el instrumento"}), 500
