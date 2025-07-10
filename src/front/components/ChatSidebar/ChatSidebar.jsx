import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { toggleFollowUser } from "../../services/followService";
import { useUserReducer } from "../../reducers/userReducer";
import { useFollowReducer } from "../../reducers/followReducer";
import { Button } from "react-bootstrap";
import "./chatSidebar.css";

const ChatSidebar = () => {
    const { userStore } = useUserReducer();
    const { followStore, followDispatch } = useFollowReducer();

    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await getAllUsers();
                setAllUsers(users);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
            }
        };
        fetchUsers();
    }, []);

    const handleFollowToggle = async (targetUser) => {
        try {
            const isFollowing = followStore.following.some((u) => u.id === targetUser.id);

            await toggleFollowUser(targetUser.id);

            if (isFollowing) {
                console.log("❌ Dejar de seguir a", targetUser.username);
                followDispatch({ type: "remove_following", payload: targetUser.id });
            } else {
                console.log("✅ Seguir a", targetUser.username);
                followDispatch({ type: "add_following", payload: targetUser });
            }
            console.log("📦 Estado actualizado:", followStore.following.map(u => u.id));
        } catch (err) {
            console.error("Error en follow/unfollow:", err);
        }
    };

    const goToChat = (userId) => {
        window.location.href = `/messages/${userId}`;
    };

    return (
        <div className="user-sidebar">
            <h5 className="mb-3 text-white">Usuarios</h5>
            {allUsers
                .filter((user) => user.id !== userStore?.user?.id)
                .map((user) => {
                    const isFollowing = followStore.following.some((f) => f.followed_id === user.id);

                    return (
                        <div key={user.id} className="d-flex flex-column align-items-start justify-content-around gap-3 mb-4 border-bottom pb-3">
                            <div className="d-flex align-items-end gap-3">
                                <img
                                    src={user.profile_pic_url}
                                    alt={user.username}
                                    className="chat_sidebar_profile_pic"
                                />
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
                                <Button size="sm" variant="success" onClick={() => goToChat(user.id)}>
                                    Message
                                </Button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default ChatSidebar;
