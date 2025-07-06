import React, { useState, useEffect } from "react";
import { createProject } from "../services/projectService";
import { getRoles, getInstruments } from "../services/roleService"; // funciones para traer datos
import { getAllGenres } from "../services/genreServices";
import { toast } from "react-toastify";
import { KEY_ENUM, METER_ENUM } from "../utils/utils"; // Asegúrate de tener este archivo con las tonalidades

export const AddProject = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        tags: "",
        bpm: "",
        key: "",
        meter: "",
        visibility: "public",
        status: "active",
        genre_ids: [],
        seeking_role_ids: [],
        seeking_instrument_ids: [],
    });

    const [genres, setGenres] = useState([]);
    const [roles, setRoles] = useState([]);
    const [instruments, setInstruments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setGenres(await getAllGenres());
            setRoles(await getRoles());
            setInstruments(await getInstruments());
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (e, field) => {
        const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
        setForm((prev) => ({ ...prev, [field]: selected }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                bpm: parseInt(form.bpm),
            };
            console.log("Payload enviado:", payload); // 👈 MUY IMPORTANTE

            const created = await createProject(payload);
            toast.success("Proyecto creado correctamente");
            console.log("Proyecto creado:", created);
        } catch (err) {
            toast.error("Error al crear el proyecto");
            console.error("ERROR AL CREAR:", err.response?.data || err.message);
        }
    };


    return (
        <div className="container mt-4 text-white">
            <h2>Crear Proyecto</h2>
            <form onSubmit={handleSubmit}>
                <input className="form-control my-2" name="title" placeholder="Título" onChange={handleChange} />
                <textarea className="form-control my-2" name="description" placeholder="Descripción" onChange={handleChange} />
                <input className="form-control my-2" name="tags" placeholder="Tags (separados por coma)" onChange={handleChange} />
                <input className="form-control my-2" name="bpm" placeholder="BPM" type="number" onChange={handleChange} />

                <select
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                >
                    <option value="">Selecciona tonalidad</option>
                    {Object.entries(KEY_ENUM).map(([key, label]) => (
                        <option key={key} value={label}>{label}</option>
                    ))}
                </select>


                <select
                    value={form.meter}
                    onChange={(e) => setForm({ ...form, meter: e.target.value })}
                >
                    <option value="">Selecciona tonalidad</option>
                    {Object.entries(METER_ENUM).map(([meter, label]) => (
                        <option key={meter} value={label}>{label}</option>
                    ))}
                </select>

                <select className="form-select my-2" name="visibility" onChange={handleChange}>
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                </select>

                <select className="form-select my-2" name="status" onChange={handleChange}>
                    <option value="active">Activo</option>
                    <option value="archived">Archivado</option>
                </select>

                <label className="mt-2">Géneros:</label>
                <select multiple className="form-select" onChange={(e) => handleMultiSelect(e, "genre_ids")}>
                    {genres.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                <label className="mt-2">Buscas Roles:</label>
                <select multiple className="form-select" onChange={(e) => handleMultiSelect(e, "seeking_role_ids")}>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>

                <label className="mt-2">Buscas Instrumentos:</label>
                <select multiple className="form-select" onChange={(e) => handleMultiSelect(e, "seeking_instrument_ids")}>
                    {instruments.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                </select>

                <button className="btn btn-success mt-4" type="submit">Crear Proyecto</button>
            </form>
        </div>
    );
};
