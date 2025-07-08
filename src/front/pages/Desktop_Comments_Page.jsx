import React from "react";
import CommentSection from "../components/CommentSection";
import { useUserReducer } from "../reducers/userReducer";
import { useProjectReducer }from "../reducers/projectReducer";

export const CommentsPage = () => {
    const { store: userStore } = useUserReducer();
    const { store: projectStore } = useProjectReducer();

    const currentUser = userStore.user;
    const selectedProject = projectStore.selectedProject;

    // Mueve el console.log AQUÍ, cuando ya tienes los datos definidos:
    console.log("📌 Comentarios para proyecto ID:", selectedProject?.id);
    console.log("👤 Usuario actual:", currentUser);

    if (!selectedProject?.id) {
        return <p>Cargando proyecto...</p>;
    }

    return (
        <CommentSection
            projectId={selectedProject.id}
            currentUser={currentUser}
        />
    );
};
