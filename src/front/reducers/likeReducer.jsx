import { useContext, useReducer, createContext } from "react";
import likeReducer, { initialLikeStore } from "../stores/likeStore";

const LikeContext = createContext();

export function LikeProvider({ children }) {
    const [store, dispatch] = useReducer(likeReducer, initialLikeStore);

    return (
        <LikeContext.Provider value={{ store, dispatch }}>
            {children}
        </LikeContext.Provider>
    );
}

export default function useLikeReducer() {
    const context = useContext(LikeContext);
    if (!context) throw new Error("useLikeReducer debe usarse dentro de LikeProvider");
    return context;
}
