import { useEffect, useState } from "react";
import { getChatMessages, sendMessageToUser, getUserChats } from "../../services/chatService";
import { useUserReducer } from "../../reducers/userReducer";
import useChatReducer from "../../reducers/chatReducer";
import "./chatModal.css";

const ChatModal = ({ otherUser }) => {
    const { userStore } = useUserReducer();
    const { chatStore, chatDispatch } = useChatReducer();
    const { chats, messages } = chatStore;

    const [newMessage, setNewMessage] = useState("");

    const currentUserId = userStore.user?.id;

    // Determinar si ya existe un chat con este usuario
    const existingChat = chats.find(
        (c) =>
            (c.user1_id === currentUserId && c.user2_id === otherUser.id) ||
            (c.user2_id === currentUserId && c.user1_id === otherUser.id)
    );

    const chatId = existingChat?.id;

    useEffect(() => {
        const loadMessages = async () => {
            if (!chatId) return;
            try {
                const msgs = await getChatMessages(chatId);
                chatDispatch({ type: "set_messages", payload: msgs });
            } catch (err) {
                console.error("❌ Error al cargar mensajes:", err);
            }
        };

        loadMessages();
    }, [chatId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            const msg = await sendMessageToUser(otherUser.id, newMessage.trim());

            // Si el chat no existía, crearlo en el store
            if (!existingChat) {
                const updatedChats = await getUserChats();
                chatDispatch({ type: "set_chats", payload: updatedChats });
            }

            chatDispatch({ type: "add_message", payload: msg });
            setNewMessage("");
        } catch (err) {
            console.error("❌ Error al enviar mensaje:", err);
        }
    };

    return (
        <div className="chat-modal-container">
            <div className="chat-modal-header">
                <img src={otherUser.profile_pic_url} alt={otherUser.username} className="chat_modal_avatar" />
                <span className="chat_modal_username">{otherUser.username}</span>
            </div>

            <div className="chat-modal-content">
                <div className="chat-modal-body">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`chat-message ${m.sender_id === currentUserId ? "sent" : "received"}`}
                        >
                            {m.content}
                        </div>
                    ))}
                </div>
                <div className="chat-modal-footer">
                    <textarea
                        type="text"
                        className="chat-input"
                        value={newMessage}
                        placeholder="Escribe un mensaje..."
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button onClick={handleSend} className="send-btn">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
