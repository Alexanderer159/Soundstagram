import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DemoProfile = () => {
    const { store } = useGlobalReducer();
    const { user } = store;

    if (!user) return <p>No hay datos de usuario disponibles.</p>;

    return (
        <div className="container mt-5 text-light">
            <h2>Mi Perfil en Demo</h2>
            <ul className="list-group bg-dark p-4 rounded">
                <li className="list-group-item bg-dark text-white">ID: {user.id}</li>
                <li className="list-group-item bg-dark text-white">Username: {user.username}</li>
                <li className="list-group-item bg-dark text-white">Email: {user.email}</li>
                <li className="list-group-item bg-dark text-white">Nombre completo: {user.full_name || 'N/A'}</li>
                <li className="list-group-item bg-dark text-white">Bio: {user.bio || 'N/A'}</li>
                <li className="list-group-item bg-dark text-white">
                    Registrado el: {new Date(user.created_at).toLocaleString()}
                </li>
                <li className="list-group-item bg-dark text-white">
                    Última actualización: {new Date(user.updated_at).toLocaleString()}
                </li>
            </ul>
        </div>
    );
};
