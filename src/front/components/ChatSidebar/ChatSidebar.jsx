import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { toggleFollowUser, getFollowing } from "../../services/followService";
import { useUserReducer } from "../../reducers/userReducer";
import { useFollowReducer } from "../../reducers/followReducer";
import useChatReducer from "../../reducers/chatReducer";
import { getUserChats } from "../../services/chatService";
import { Button } from "react-bootstrap";
import ChatModal from "../ChatModal/ChatModal";
import "./chatSidebar.css";

const ChatSidebar = () => {
    const { userStore } = useUserReducer();
    const { followStore, followDispatch } = useFollowReducer();
    const { chatStore, chatDispatch } = useChatReducer();
    const { chats, currentChat } = chatStore;

    const [allUsers, setAllUsers] = useState([]);

    const currentUserId = userStore?.user?.id;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const users = await getAllUsers();
                setAllUsers(users);

                const chats = await getUserChats();
                chatDispatch({ type: "set_chats", payload: chats });
            } catch (err) {
                console.error("Error al cargar usuarios o chats:", err);
            }
        };

        fetchInitialData();
    }, []);

    const handleFollowToggle = async (targetUser) => {
        try {
            await toggleFollowUser(targetUser.id);
            const updated = await getFollowing(currentUserId);
            followDispatch({ type: "set_following", payload: updated });

        } catch (err) {
            console.error("Error en follow/unfollow:", err);
        }
    };

    const openChatWithUser = (user) => {
        chatDispatch({ type: "set_current_chat", payload: user });
    };

    return (
        <div className="chat-sidebar">
            <h5 className="mb-3 text-white">Usuarios</h5>

            {/* Lista de usuarios con los que ya tienes chats */}
            <div className="mb-4 chat-active-users">
                <p className=" small">Tus chats activos</p>
                {chats.map((chat) => {
                    const otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
                    const user = allUsers.find((u) => u.id === otherUserId);
                    if (!user) return null;

                    return (
                        <div
                            key={chat.id}
                            className="d-flex align-items-center gap-2 mb-2 chat-user clickable"
                            onClick={() => openChatWithUser(user)}
                        >
                            <img src={user.profile_pic_url} alt={user.username} className="chat_sidebar_profile_pic" />
                            <span className="text-white">{user.username}</span>
                        </div>
                    );
                })}
            </div>

            {/* Lista completa de usuarios */}
            <div>
                <p className="small">Todos los usuarios</p>
                {allUsers
                    .filter((user) => user.id !== currentUserId)
                    .map((user) => {
                        const isFollowing = followStore.following.some((f) => f.followed_id === user.id);

                        return (
                            <div key={user.id} className="d-flex flex-column align-items-start justify-content-around gap-3 mb-4 border-bottom pb-3">
                                <div className="d-flex align-items-end gap-3">
                                    <img src={user.profile_pic_url} alt={user.username} className="chat_sidebar_profile_pic" />
                                    <span className="text-sm text-white">{user.username}</span>
                                </div>
                                <div>
                                    <Button
                                        size="sm"
                                        variant={isFollowing ? "danger" : "primary"}
                                        onClick={() => handleFollowToggle(user)}
                                        className="me-1"
                                    >
                                        {isFollowing ? "Unfollow" : "Follow"}
                                    </Button>
                                    <Button size="sm" variant="success" onClick={() => openChatWithUser(user)}>
                                        Message
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Modal de chat si hay conversación activa */}
            {currentChat && <ChatModal otherUser={currentChat} />}
        </div>
    );
};

export default ChatSidebar;
