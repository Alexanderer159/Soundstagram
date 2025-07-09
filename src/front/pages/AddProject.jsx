import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProject } from "../services/projectService";
import { getRoles, getInstruments } from "../services/roleService";
import { getAllGenres } from "../services/genreServices";
import { toast } from "react-toastify";
import { KEY_ENUM, METER_ENUM } from "../utils/utils";
import "../styles/addproject.css"
import "../styles/index.css"

export const AddProject = () => {

   const navigate = useNavigate()

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

            sessionStorage.setItem("ProjectInfo", JSON.stringify(form));
            navigate("/uploader-poster");

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
<>
    <div className="container-fluid m-5 text-white">

        <div className="row">
            <div className="col">
                <p className="fs-1 text-center">Create a project</p>
            </div>
        </div>
            
        <div className="row">
            <div className="col d-flex justify-content-center">

                <form  onSubmit={handleSubmit} className="project-form px-3 py-2 d-flex flex-column gap-3">
                    <div className="row">
                        <div className="col d-flex flex-column justify-content-between gap-1">

                            <label className="mt-2">Title</label>
                            <input className="my-2 project-form-input" name="title" placeholder="Title" onChange={handleChange} />

                            <label className="mt-2">Description</label>
                            <textarea className="my-2 project-form-input" name="description" placeholder="Description" onChange={handleChange} />

                            <label className="mt-2">Tags</label>
                            <input className=" my-2 project-form-input" name="tags" placeholder="Tag (comma separated)" onChange={handleChange} />

                            <label className="mt-2">Extra info</label>
                            <input className=" my-2 project-form-input" name="bpm" placeholder="BPM" type="number" onChange={handleChange} />

                            <div className="d-flex flex-row gap-3">
                                <select className="project-form-input py-2 clicky-project-form" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}>

                                    <option value="">Select a key</option>
                                    {Object.entries(KEY_ENUM).map(([key, label]) => (<option key={key} value={label}>{label}</option>))}

                                </select>

                                <select className="project-form-input py-2 clicky-project-form" value={form.meter} onChange={(e) => setForm({ ...form, meter: e.target.value })} >

                                    <option value="">Select a compass</option>
                                    {Object.entries(METER_ENUM).map(([meter, label]) => (<option key={meter} value={label}>{label}</option>))}

                                </select>
                            </div>
                            <div className="d-flex flex-row gap-3">
                                <select className="form-select my-2 project-form-input clicky-project-form" name="visibility" onChange={handleChange}>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>

                                <select className="form-select my-2 project-form-input clicky-project-form" name="status" onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>    

                        <div className="col d-flex flex-column justify-content-between">

                            <label className="mt-2">Genre</label>

                            <select multiple className="project-form-input clicky-project-form" onChange={(e) => handleMultiSelect(e, "genre_ids")}>

                                {genres.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}

                            </select>

                            <label className="mt-2">Project's roles</label>

                            <select multiple className=" project-form-input clicky-project-form" onChange={(e) => handleMultiSelect(e, "seeking_role_ids")}>
                                
                                {roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}

                            </select>

                            <label className="mt-2">Project's instruments</label>

                            <select multiple className="project-form-input clicky-project-form" onChange={(e) => handleMultiSelect(e, "seeking_instrument_ids")}>

                                {instruments.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}

                            </select>

                        </div>
                    </div>

                        <button className="btn-sub-project-form my-2" type="submit">Create Project</button>

                </form>
            </div>
        </div>
    </div>
</>
    );
};
