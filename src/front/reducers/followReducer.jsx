import { useContext, useReducer, createContext, useEffect } from "react";
import followReducer, { initialFollowStore } from "../stores/followStore";
import { getFollowing } from "../services/followService";
import { useUserReducer } from "./userReducer";

const FollowContext = createContext();

export function FollowProvider({ children }) {
    const [store, dispatch] = useReducer(followReducer, initialFollowStore);
    const { userStore } = useUserReducer();
    const userId = userStore?.user?.id;




    useEffect(() => {

        if (!userId) return;

        const fetchFollowing = async () => {
            try {
                const data = await getFollowing(userId);
                dispatch({ type: "set_following", payload: data });
            } catch (err) {
                console.error("❌ Error en fetchFollowing:", err.message);
            }
        };

        fetchFollowing();
    }, [userId]);


    return (
        <FollowContext.Provider value={{ followStore: store, followDispatch: dispatch }}>
            {children}
        </FollowContext.Provider>
    );
}

export function useFollowReducer() {
    const context = useContext(FollowContext);
    if (!context) throw new Error("useFollowReducer debe usarse dentro de FollowProvider");
    return context;
}
