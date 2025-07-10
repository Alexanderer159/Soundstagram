// reducers/likeReducer.jsx
import { useContext, useEffect, useReducer, createContext } from "react";
import likeReducer, { initialLikeStore } from "../stores/likeStore";
import { getUserLikes } from "../services/likeService";
import { useUserReducer } from "./userReducer";

const LikeContext = createContext();

export function LikeProvider({ children }) {
    const [store, dispatch] = useReducer(likeReducer, initialLikeStore);
    const { userStore } = useUserReducer();
    const userId = userStore?.user?.id;

    useEffect(() => {
        const fetchUserLikes = async () => {
            if (!userId) return;
            try {
                const data = await getUserLikes(userId);
                dispatch({ type: "set_user_likes", payload: data });
            } catch (err) {
                dispatch({ type: "set_error", payload: err.message });
            }
        };

        fetchUserLikes();
    }, [userId]);

    return (
        <LikeContext.Provider value={{ likeStore: store, likeDispatch: dispatch }}>
            {children}
        </LikeContext.Provider>
    );
}

export default function useLikeReducer() {
    const context = useContext(LikeContext);
    if (!context) throw new Error("useLikeReducer debe usarse dentro de LikeProvider");
    return context;
}
