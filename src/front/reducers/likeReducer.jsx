// reducers/likeReducer.jsx
import { useContext, useEffect, useReducer, createContext } from "react";
import likeReducer, { initialLikeStore } from "../stores/likeStore";
import { getUserLikes } from "../services/likeService";
import { useUserReducer } from "./userReducer";

const LikeContext = createContext();

export function LikeProvider({ children }) {
    const [likeStore, likeDispatch] = useReducer(likeReducer, initialLikeStore);
    const { userStore } = useUserReducer();
    const { user } = userStore;

    useEffect(() => {
        const fetchUserLikes = async () => {
            if (!user?.id) return;
            likeDispatch({ type: "set_loading" });
            try {
                const data = await getUserLikes(user.id);
                console.log("✅ Likes del usuario cargados:", data);
                likeDispatch({ type: "set_user_likes", payload: data });
            } catch (err) {
                likeDispatch({ type: "set_error", payload: err.message });
            }
        };

        fetchUserLikes();
    }, [user?.id]);

    return (
        <LikeContext.Provider value={{ likeStore, likeDispatch }}>
            {children}
        </LikeContext.Provider>
    );
}

export default function useLikeReducer() {
    const context = useContext(LikeContext);
    if (!context) throw new Error("useLikeReducer debe usarse dentro de LikeProvider");
    return context;
}
