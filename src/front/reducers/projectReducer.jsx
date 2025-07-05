import { useContext, useReducer, createContext } from "react";
import projectReducer, { initialProjectStore } from "../stores/projectStore";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [store, dispatch] = useReducer(projectReducer, initialProjectStore);

    return (
        <ProjectContext.Provider value={{ store, dispatch }}>
            {children}
        </ProjectContext.Provider>
    );
}

export default function useProjectReducer() {
    const { store, dispatch } = useContext(ProjectContext);
    return { store, dispatch };
}
