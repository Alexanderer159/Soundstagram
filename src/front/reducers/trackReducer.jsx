import { createContext, useContext, useReducer } from "react";
import trackReducer, { initialTrackStore } from "../stores/trackStore";

const TrackContext = createContext();

export function TrackProvider({ children }) {
    const [store, dispatch] = useReducer(trackReducer, initialTrackStore);

    return (
        <TrackContext.Provider value={{ trackStore: store, trackDispatch: dispatch }}>
            {children}
        </TrackContext.Provider>
    );
}

export default function useTrackReducer() {
    const context = useContext(TrackContext);
    if (!context) {
        throw new Error("useTrackReducer debe usarse dentro de un <TrackProvider>");
    }
    return context;
}
