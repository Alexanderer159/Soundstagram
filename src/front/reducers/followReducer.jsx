import { useContext, useReducer, createContext } from "react";
import followReducer, { initialFollowStore } from "../stores/followStore";

const FollowContext = createContext();

export function FollowProvider({ children }) {
    const [store, dispatch] = useReducer(followReducer, initialFollowStore);

    return (
        <FollowContext.Provider value={{ store, dispatch }}>
            {children}
        </FollowContext.Provider>
    );
}

export default function useFollowReducer() {
    const context = useContext(FollowContext);
    if (!context) throw new Error("useFollowReducer debe usarse dentro de FollowProvider");
    return context;
}
