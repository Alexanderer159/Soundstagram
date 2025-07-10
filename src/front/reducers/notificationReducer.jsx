import { useContext, useReducer, createContext } from "react";
import notificationReducer, { initialNotificationStore } from "../stores/notificationStore";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [store, dispatch] = useReducer(notificationReducer, initialNotificationStore);

    return (
        <NotificationContext.Provider value={{ notificationStore: store, notificationDispatch: dispatch }}>
            {children}
        </NotificationContext.Provider>
    );
}

export default function useNotificationReducer() {
    const { store, dispatch } = useContext(NotificationContext);
    return { store, dispatch };
}
