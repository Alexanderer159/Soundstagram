import React, { useEffect, useState } from 'react';
import './ProjectCard.css';
import useLikeReducer from '../../reducers/likeReducer';
import { toggleProjectLike } from '../../services/likeService';
import { useUserReducer } from '../../reducers/userReducer';

const ProjectCard = ({ project }) => {
    const { likeStore, likeDispatch } = useLikeReducer();
    const { userLikes } = likeStore;
    const { userStore } = useUserReducer();
    const { user } = userStore;

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        console.log("🎯 userLikes en ProjectCard:", userLikes);
        const hasLiked = userLikes.some(like => like.project_id === project.id);
        setLiked(hasLiked);
    }, [userLikes, project.id]);

    const handleLikeToggle = async () => {
        console.log('🔁 Intentando toggle de like');
        console.log('Proyecto:', project.id, '-', project.title);
        console.log('Usuario:', user?.id);

        try {
            const res = await toggleProjectLike(project.id);
            console.log('✅ Respuesta del backend:', res);

            if (liked) {
                likeDispatch({ type: "remove_like", payload: { project_id: project.id } });
                setLikeCount(prev => prev - 1);
            } else {
                likeDispatch({ type: "add_like", payload: { project_id: project.id, user_id: user.id } });
                setLikeCount(prev => prev + 1);
            }

            setLiked(!liked);
        } catch (err) {
            console.error("❌ Error al dar like:", err);
        }
    };


    return (
        <div className="project_card">
            <div className="project_card_header">
                <div className="d-flex justify-start align-items-end gap-5">
                    <div className="owner_container">
                        <img
                            src={project.owner_pic}
                            alt={project.owner_username}
                            className="profile_pic_project_card"
                        />
                        <span className="owner_username">{project.owner_username}</span>
                    </div>
                    <h3 className="text-lg font-bold">{project.title}</h3>
                </div>

                {project.collaborators?.length > 0 && (
                    <div className="collaborators_container">
                        {project.collaborators.map((colab) => (
                            <div key={colab.id} className="collaborator_avatar">
                                <img
                                    src={colab.profile_pic_url}
                                    alt={colab.username}
                                    className="profile_pic_project_card"
                                />
                                <span className="owner_username">{colab.username}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="especifications_container">
                    <div className='project_especifications'><span className="font-bold">BPM</span> {project.bpm}</div>
                    <div className='project_especifications'><span className="font-bold ml-2">Key</span> {project.key}</div>
                    <div className='project_especifications'><span className="font-bold ml-2">Meter</span> {project.meter}</div>
                </div>
            </div>

            <p className="text-sm text-gray-400">{project.description}</p>

            <div className="project_card_footer">
                <div>
                    Esta buscando:
                    {project.seeking_roles.map((r) => (
                        <span key={r.id} className="pill">{r.name}</span>
                    ))}
                    {project.seeking_instruments.map((i) => (
                        <span key={i.id} className="pill">{i.name}</span>
                    ))}
                </div>

                <div className="footer_right_corner">
                    <div>
                        {project.genres.map((g) => (
                            <span key={g.id} className="pill">{g.name}</span>
                        ))}
                    </div>
                    <button className={`like_button ${liked ? 'liked' : ''}`} onClick={handleLikeToggle}>
                        {liked ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
