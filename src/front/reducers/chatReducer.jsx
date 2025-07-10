import { useContext, useReducer, createContext } from "react";
import chatReducer, { initialChatStore } from "../stores/chatStore";

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [store, dispatch] = useReducer(chatReducer, initialChatStore);

    return (
        <ChatContext.Provider value={{ chatStore: store, chatDispatch: dispatch }}>
            {children}
        </ChatContext.Provider>
    );
}

export default function useChatReducer() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChatReducer debe usarse dentro de ChatProvider");
    return context;
}
