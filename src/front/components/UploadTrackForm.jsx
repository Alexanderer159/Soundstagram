import { useState } from "react";
import { uploadTrackToCloudinary } from "../services/cloudinaryService";
import { createTrack } from "../services/trackService";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";

const UploadTrackForm = ({ projectId }) => {
    const [file, setFile] = useState(null);
    const [trackName, setTrackName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(0); 
    const [instrumentId, setInstrumentId] = useState(null);

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !trackName) {
            toast.error("Debes proporcionar un archivo y un nombre de pista");
            return;
        }

        try {
            console.log("🎵 Iniciando subida de track:");
            console.log("📄 Nombre:", trackName);
            console.log("📝 Descripción:", description);
            console.log("🎻 Instrumento ID:", instrumentId);
            console.log("📁 Archivo seleccionado:", file);
            console.log("📌 Project ID:", projectId);

            toast.info("Subiendo archivo a Cloudinary...");
            const file_url = await uploadTrackToCloudinary(file);

            console.log("🌐 URL recibida de Cloudinary:", file_url);

            const newTrack = {
                track_name: trackName,
                file_url,
                description,
                duration,
                instrument_id: instrumentId,
                project_id: projectId,
            };

            console.log("📦 Enviando al backend:", newTrack);
            await createTrack(newTrack);

            toast.success("Track subida correctamente");
            console.log("✅ Track registrada correctamente en la base de datos");

            // Reset form
            setFile(null);
            setTrackName("");
            setDescription("");
            setInstrumentId(null);
        } catch (err) {
            console.error("❌ Error en el proceso de subida:", err);
            toast.error("Error al subir la track");
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Nombre de la Track</Form.Label>
                <Form.Control
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Archivo de audio</Form.Label>
                <Form.Control
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Descripción (opcional)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            {/* Puedes reemplazar esto por un selector real de instrumentos */}
            <Form.Group>
                <Form.Label>Instrumento (ID opcional)</Form.Label>
                <Form.Control
                    type="number"
                    value={instrumentId || ""}
                    onChange={(e) => setInstrumentId(parseInt(e.target.value))}
                />
            </Form.Group>

            <Button type="submit" className="mt-3">
                Subir Track
            </Button>
        </Form>
    );
};

export default UploadTrackForm;
