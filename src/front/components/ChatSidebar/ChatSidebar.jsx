import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { Link, useNavigate } from "react-router-dom";
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
         if (currentChat && currentChat.id === user.id) {
        chatDispatch({ type: "set_current_chat", payload: null });
    } else {
        chatDispatch({ type: "set_current_chat", payload: user });
    }
    };

    return (
<>
        <div className="container-fluid chat-sidebar text-white px-4 py-2">

            <p className="text-white fs-1 text-center">Users</p>

            <div className="chat-active-users mb-4 pb-3">

                <p className="fs-5 text-center">Active Chats</p>

                {chats.map((chat) => {const otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id; const user = allUsers.find((u) => u.id === otherUserId);
                    if (!user) return null;

                    return (
                        <div key={chat.id} className="d-flex align-items-center gap-3 mb-2 chat-user clickable cursor-pointer" onClick={() => openChatWithUser(user)} >

                            <img src={user.profile_pic_url} className="chat_sidebar_profile_pic" />

                            <span className="text-white">{user.username}</span>
                        </div>
                    );
                })}
            </div>

            
                <details className="dropdown_section">

                    <summary className="fs-2 pb-3">All users</summary>

                <div className="all-users-container p-3">         
                    {allUsers .filter((user) => user.id !== currentUserId) .map((user) => { const isFollowing = followStore.following.some((f) => f.followed_id === user.id);

                        return (
                            <div key={user.id} className="user-chat d-flex flex-column align-items-start gap-3 mb-4 pb-3">

                                <div className="d-flex align-items-center gap-3">

                                    <Link to={`/profile/${user.username}`}>
                                        <img src={user.profile_pic_url} className="chat_sidebar_profile_pic" />
                                    </Link>

                                    <span className="text-white">{user.username}</span>

                                </div>

                                <div className="d-flex gap-2">
                                    <button onClick={() => handleFollowToggle(user)} className={isFollowing ? "chat-btn-unfollow me-1" : "chat-btn-follow me-1"}> {isFollowing ? "Following" : "Follow"} </button>
                                    <button className="chat-btn-follow" onClick={() => openChatWithUser(user)}> Message</button>
                                </div>

                            </div>);})}
                </div>   
                </details>

            {currentChat && <ChatModal otherUser={currentChat} />}
        </div>
</>
    );
};

export default ChatSidebar;
