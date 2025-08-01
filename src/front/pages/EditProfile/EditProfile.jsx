import React, { useState, useEffect, useRef } from "react";
import "../../styles/index.css";
import "./editprofile.css";
import { Link, useNavigate } from "react-router-dom";
import { useUserReducer } from "../../reducers/userReducer";
import { updateUser } from "../../services/userService";
import { getRoles, getInstruments } from "../../services/roleService";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { toast } from "react-toastify";
import defaultPic from '../../assets/default-profile.png';

export const EditProfile = () => {
    const { userStore, userDispatch } = useUserReducer();
    const { user } = userStore;
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [rolesList, setRolesList] = useState([]);
    const [instrumentsList, setInstrumentsList] = useState([]);

    const [formData, setFormData] = useState({
        username: user.username || "No user yet",
        bio: user.bio || "No bio yet",
        profile_pic_url: user.profile_pic_url || defaultPic,
        roles: user.roles?.map((r) => r.id) || [],
        instruments: user.instruments?.map((i) => i.id) || [],
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
            setFormData({
                username: user.username || "No user yet",
                bio: user.bio || "No bio yet",
                profile_pic_url: user.profile_pic_url || defaultPic,
                roles: user.roles?.map((r) => r.id) || [],
                instruments: user.instruments?.map((i) => i.id) || [],
                spotify_playlist: user.spotify_playlist || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        try {
            const url = await uploadToCloudinary(file);
            setFormData((prev) => ({
                ...prev,
                profile_pic_url: url,
            }));
            setSelectedImage(file);
        } catch (err) {
            console.error("Error al subir la imagen:", err);
            toast.error("Error al subir la imagen");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateUser(user.id, formData);
            userDispatch({ type: "update_user", payload: updated });
            toast.success("Perfil actualizado");
            navigate("/feed");
        } catch (err) {
            console.error("Error al actualizar el perfil:", err);
            toast.error(err || "Error al actualizar");
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <p className="change text-center">Time for a change...</p>
            </div>

            <form className="row text-white" onSubmit={handleSubmit}>
                <div className="col combo d-flex justify-content-end ">
                    <img
                        src={formData.profile_pic_url}
                        className="prof-pic-edit rounded-circle"
                        onClick={() => fileInputRef.current.click()}
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

                <div className="col">
                    <div className="d-flex flex-column justify-content-center gap-3 all-form-edit pt-3 pb-4 px-5">
                        <div>
                            <label htmlFor="NameInput" className="form-label fs-2">Username</label>
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

                        <div>
                            <label htmlFor="BioInput" className="form-label fs-2">Bio</label>
                            <textarea
                                name="bio"
                                className="inp-edi-prof form-control bg-dark text-white"
                                id="BioInput"
                                rows="2"
                                onChange={handleChange}
                                placeholder={user.bio}
                                value={formData.bio}
                            />
                        </div>

                        <div className="register-selects d-flex flex-row justify-content-between gap-5">
                            <div className="d-flex flex-column w-50">
                                <label className="form-label fs-3">Roles</label>
                                <select
                                    onChange={(e) => handleSelect(e, 'roles')}
                                    className="inp-edi-prof bg-dark text-white p-2 cursor-pointer"
                                >
                                    <option value="">What's your role?</option>
                                    {rolesList.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="my-2">
                                    {formData.roles.map((roleId) => {
                                        const role = rolesList.find((r) => r.id === roleId);
                                        return (
                                            <button
                                                key={roleId}
                                                type="button"
                                                className="badge me-2 mb-2"
                                                onClick={() => removeSelected(roleId, 'roles')}
                                            >
                                                {role?.name} ✖
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="d-flex flex-column w-50">
                                <label className="form-label fs-3">Instruments</label>
                                <select
                                    onChange={(e) => handleSelect(e, 'instruments')}
                                    className="inp-edi-prof bg-dark text-white p-2 cursor-pointer"
                                >
                                    <option value="">What's your instrument?</option>
                                    {instrumentsList.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="my-2">
                                    {formData.instruments.map((instrId) => {
                                        const instr = instrumentsList.find((i) => i.id === instrId);
                                        return (
                                            <button
                                                key={instrId}
                                                type="button"
                                                className="badge me-2 mb-2"
                                                onClick={() => removeSelected(instrId, 'instruments')}
                                            >
                                                {instr?.name} ✖
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="PlaylistInput" className="form-label fs-3">Playlist</label>
                            <input
                                type="text"
                                name="spotify_playlist"
                                className="inp-edi-prof form-control bg-dark text-white"
                                id="PlaylistInput"
                                onChange={handleChange}
                                placeholder="Spotify Playlist URL"
                                value={formData.spotify_playlist}
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <Link to="/profile" className="text-decoration-none">
                                <button type="button" className="pro-edit-disc">Discard Changes</button>
                            </Link>

                            <button type="submit" className="pro-edit-btn">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
