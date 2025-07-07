import React, { useState, useEffect, useRef } from "react";
import "../styles/index.css";
import "../styles/editprofile.css";
import { Link, useNavigate } from "react-router-dom";
import { useUserReducer } from "../reducers/userReducer"
import { updateUser } from "../services/userService";
import { getRoles, getInstruments } from "../services/roleService";
import { uploadToCloudinary } from "../services/cloudinaryService";
import { toast } from "react-toastify";

export const EditProfilePage = () => {
    const { store, dispatch } = useUserReducer();
    const user = store.user;
    const navigate = useNavigate();
    const fileInputRef = useRef();
    const [rolesList, setRolesList] = useState([]);
    const [instrumentsList, setInstrumentsList] = useState([]);


    const [formData, setFormData] = useState({
        username: user.username || "",
        bio: user.bio || "",
        profile_pic_url: user.profile_pic_url || "/avatars/usuaria_luna.png",
        roles: user.roles?.map(r => r.id) || [],
        instruments: user.instruments?.map(i => i.id) || [],
        spotify_playlist: user.spotify_playlist || "",
    });

    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const getRolesAndInstruments = async () => {
            try {
                const roles = await getRoles();
                const instruments = await getInstruments();
                setRolesList(roles);
                setInstrumentsList(instruments);
            } catch (error) {
                toast.error('No se pudieron cargar roles o instrumentos');
            }
        };

        getRolesAndInstruments();
        if (user) {
            console.log("Usuario cargado desde store:", user);
            setFormData({
                username: user.username || "",
                bio: user.bio || "",
                profile_pic_url: user.profile_pic_url || "/avatars/usuaria_luna.png",
                spotify_playlist: user.spotify_playlist || "",
                roles: user.roles?.map(r => r.id) || [],
                instruments: user.instruments?.map(i => i.id) || [],
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log(`Campo editado: ${name} =>`, value); // ⬅️ NUEVO
    };

    const handleSelect = (e, field) => {
        const value = parseInt(e.target.value);
        if (!value || formData[field].includes(value)) return;

        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], value],
        }));
    };

    const removeSelected = (id, field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((item) => item !== id),
        }));
    };



    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        console.log("Imagen seleccionada:", file.name); // ⬅️ NUEVO
        try {
            const url = await uploadToCloudinary(file);
            console.log("URL subida a Cloudinary:", url); // ⬅️ NUEVO
            setFormData((prev) => ({
                ...prev,
                profile_pic_url: url,
            }));
            setSelectedImage(file);
        } catch (err) {
            console.error("Error al subir la imagen:", err); // ⬅️ NUEVO
            toast.error("Error al subir la imagen");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Formulario enviado con los datos:", formData); // ⬅️ NUEVO
        try {
            const updated = await updateUser(user.id, formData);
            console.log("Usuario actualizado correctamente:", updated); // ⬅️ NUEVO
            dispatch({ type: "update_user", payload: updated });
            toast.success("Perfil actualizado");
            navigate("/profile");
        } catch (err) {
            console.error("Error al actualizar el perfil:", err); // ⬅️ NUEVO
            toast.error(err || "Error al actualizar");
        }
    };

    return (
        <>
            <div className="container-fluid d-flex flex-column m-5 px-5">
                <div className="pb-5 d-flex justify-content-around align-items-center">
                    <h1 className="header text-start">Edit Profile</h1>
                    <div className="d-flex flex-row justify-content-between">
                        <h1 className="change justify-content-end px-5 mx-5">Time for a change...</h1>
                    </div>
                </div>

                <form className="proform text-light w-100 d-flex align-items-start justify-content-center gap-5">
                    <div className="combo d-flex flex-row align-items-center gap-3">
                        <img
                            src={formData.profile_pic_url}
                            className="rounded-circle"
                            onClick={() => fileInputRef.current.click()}
                            style={{ cursor: "pointer", width: "180px", height: "180px", objectFit: "cover" }}
                        />
                        <input
                            type="file"
                            name="profile_pic_file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="d-none"
                        />
                    </div>
                    <div className="form-container d-flex flex-column justify-content-center gap-3 w-50">
                        <div className="mb-3">
                            <label htmlFor="NameInput" className="form-label fs-3">{user.username}</label>
                            <input
                                type="text"
                                name="username"
                                className="inp-edi-prof form-control bg-dark text-white"
                                id="NameInput"
                                onChange={handleChange}
                                placeholder={user.username}
                                value={formData.username}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="BioInput" className="form-label fs-3">Bio</label>
                            <textarea
                                name="bio"  // ✅ FALTABA ESTO
                                className="form-control bg-dark text-light"
                                id="BioInput"
                                rows="5"
                                onChange={handleChange}
                                placeholder={user.bio}
                                value={formData.bio}
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <div className="register-selects d-flex justify-content-between gap-3">
                                <div className="d-flex flex-column">
                                    <label className="form-label fs-5">Roles</label>
                                    <select onChange={(e) => handleSelect(e, 'roles')} className="register-input" style={{ minWidth: "300px" }}>
                                        <option value="">What's your role?</option>
                                        {rolesList.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {formData.roles.map((roleId) => {
                                            const role = rolesList.find((r) => r.id === roleId);
                                            return (
                                                <button key={roleId} type="button" className="badge bg-light text-dark" onClick={() => removeSelected(roleId, 'roles')}>
                                                    {role?.name} ✖
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="d-flex flex-column">
                                    <label className="form-label fs-5">Instruments</label>
                                    <select onChange={(e) => handleSelect(e, 'instruments')} className="register-input" style={{ minWidth: "300px" }}>
                                        <option value="">What's your instrument?</option>
                                        {instrumentsList.map((inst) => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {formData.instruments.map((instrId) => {
                                            const instr = instrumentsList.find((i) => i.id === instrId);
                                            return (
                                                <button key={instrId} type="button" className="badge bg-light text-dark" onClick={() => removeSelected(instrId, 'instruments')}>
                                                    {instr?.name} ✖
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="mb-3">
                            <label htmlFor="PlaylistInput" className="form-label fs-3">Playlist</label>
                            <input
                                type="text"
                                name="spotify_playlist"
                                className="inp-edi-prof form-control bg-dark text-white"
                                id="PlaylistInput"
                                onChange={handleChange}
                                placeholder={user.spotify_playlist || "Spotify Playlist URL"}
                                value={user.spotify_playlist}
                            />
                        </div>
                        <div className="d-flex flex-row justify-content-between">
                            <Link to="/profile" style={{ textDecoration: 'none' }}>
                                <button className="pro-edit-disc">Discard Changes</button>
                            </Link>
                            <Link to="/profile" style={{ textDecoration: 'none' }}>
                                <button type="sumbit" className="pro-edit-btn" onClick={handleSubmit}>Save Changes</button>
                            </Link>
                        </div>
                    </div>
                </form >
            </div >
        </>
    );
}