import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getProjectsByUser, getTracksByUser, logoutUser } from "../service/services";
import { useNavigate } from "react-router-dom";

export const DemoProfile = () => {
    const { store, dispatch } = useGlobalReducer();
    const { user } = store;

    const [projects, setProjects] = useState([]);
    const [tracks, setTracks] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        dispatch({ type: "logout" });
        navigate("/");
    };

    useEffect(() => {
        console.log("Usuario cargado:", user);

        if (user?.id) {
            getProjectsByUser(user.id)
                .then(data => {
                    console.log("Proyectos recibidos:", data);
                    setProjects(data);
                })
                .catch(err => console.error("Error obteniendo proyectos:", err));

            getTracksByUser(user.id)
                .then(data => {
                    console.log("Tracks recibidos:", data);
                    setTracks(data);
                })
                .catch(err => console.error("Error obteniendo tracks:", err));
        }
    }, [user]);

    if (!user) return <p>No hay datos de usuario disponibles.</p>;

    return (
        <div className="container mt-5 text-light">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Mi Perfil en Demo</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>

            <ul className="list-group bg-dark p-4 rounded">
                <li className="list-group-item bg-dark text-white">ID: {user.id}</li>
                <li className="list-group-item bg-dark text-white">Username: {user.username}</li>
                <li className="list-group-item bg-dark text-white">Email: {user.email}</li>
                <li className="list-group-item bg-dark text-white">Bio: {user.bio || 'N/A'}</li>
                <li className="list-group-item bg-dark text-white">
                    Registrado el: {new Date(user.created_at).toLocaleString()}
                </li>
                <li className="list-group-item bg-dark text-white">
                    Última actualización: {new Date(user.updated_at).toLocaleString()}
                </li>
            </ul>

            <h4 className="mt-5">Proyectos del usuario</h4>
            {projects.length === 0 ? (
                <p>No hay proyectos.</p>
            ) : (
                <ul className="list-group">
                    {projects.map(project => (
                        <li key={project.id} className="list-group-item bg-secondary text-white">
                            {project.title} - ({project.visibility})
                        </li>
                    ))}
                </ul>
            )}

            <h4 className="mt-5">Tracks del usuario</h4>
            {tracks.length === 0 ? (
                <p>No hay tracks.</p>
            ) : (
                <ul className="list-group">
                    {tracks.map(track => (
                        <li key={track.id} className="list-group-item bg-secondary text-white">
                            {track.track_name} ({track.instrument})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
