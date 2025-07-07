import { useContext, useReducer, createContext } from "react";
import projectReducer, { initialProjectStore } from "../stores/projectStore";
import { getPublicProjects } from "../services/projectService";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [store, dispatch] = useReducer(projectReducer, initialProjectStore);

    const fetchPublicProjects = async () => {
        dispatch({ type: "set_loading" });
        try {
            const data = await getPublicProjects();
            dispatch({ type: "set_projects", payload: data });
        } catch (err) {
            dispatch({ type: "set_error", payload: err.message });
        }
    };

    return (
        <ProjectContext.Provider value={{ projectStore: store, projectDispatch: dispatch, fetchPublicProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectReducer() {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useProjectStore debe usarse dentro de <ProjectProvider>");
    return context;
}

