// src/components/UploadTrackModal/UploadTrackModal.jsx
import React, { useState, useEffect } from "react";
import { uploadTrackToCloudinary } from "../../services/cloudinaryService";
import { createTrack } from "../../services/trackService";
import { useUserReducer } from "../../reducers/userReducer";
import { getInstruments } from '../../services/roleService';

const AddTrackModal = ({ projectId, onTrackCreated }) => {
    const [trackData, setTrackData] = useState({
        track_name: "",
        instrument_id: "",
        description: "",
        file: null,
    });

    const [uploading, setUploading] = useState(false);
    const { currentUser } = useUserReducer();
    const [instrumentsList, setInstrumentsList] = useState([]);

    useEffect(() => {
        const getAllInstruments = async () => {
            try {
                const instruments = await getInstruments();
                setInstrumentsList(instruments);
            } catch (error) {
                toast.error('No se pudieron cargar roles o instrumentos');
            }
        };

        getAllInstruments();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setTrackData((prev) => ({ ...prev, file }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTrackData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const { track_name, instrument_id, file, description } = trackData;

        if (!track_name || !instrument_id || !file) {
            alert("Completa todos los campos obligatorios.");
            return;
        }

        setUploading(true);
        try {
            const file_url = await uploadTrackToCloudinary(file);

            const payload = {
                track_name,
                instrument_id,
                file_url,
                description,
                project_id: projectId,
                duration: 0,
            };

            const newTrack = await createTrack(payload);
            if (onTrackCreated) onTrackCreated(newTrack);

            // Limpiar y cerrar modal
            setTrackData({ track_name: "", instrument_id: "", description: "", file: null });
            const modal = bootstrap.Modal.getInstance(document.getElementById("UploadModal"));
            if (modal) modal.hide();
        } catch (error) {
            console.error("❌ Error al subir la track:", error);
            alert("Error al subir la track.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="modal fade" id="UploadModal" tabIndex="-1" aria-labelledby="UploadModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header d-flex flex-column gap-2 p-4 bg-dark text-white">
                            <p className="fs-2 m-0 p-0">Upload New Track</p>
                        </div>

                        <div className="modal-body d-flex flex-column gap-4">
                            <input
                                className="form-control text-uppy-input p-3"
                                placeholder="Track Name"
                                name="track_name"
                                value={trackData.track_name}
                                onChange={handleInputChange}
                            />
                            <select
                                className="form-select text-uppy-input p-3"
                                name="instrument_id"
                                value={trackData.instrument_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Selecciona un instrumento</option>
                                {instrumentsList.map((inst) => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.name}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                className="form-control text-uppy-input p-3"
                                placeholder="Description"
                                name="description"
                                value={trackData.description}
                                onChange={handleInputChange}
                            />
                            <input className="form-control file-in m-1 p-1" type="file" accept="audio/*" onChange={handleFileChange} />

                            <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handleSubmit} disabled={uploading}>
                                {uploading ? "Uploading..." : "Submit Track"}
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-close-modal" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddTrackModal;
