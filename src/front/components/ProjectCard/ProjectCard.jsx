import React, { useEffect, useState } from 'react';
import useLikeReducer from '../../reducers/likeReducer';
import { getUserLikes, toggleProjectLike } from '../../services/likeService';
import { useUserReducer } from '../../reducers/userReducer';
import "./projectcard.css";

export const ProjectCard = ({ project }) => {

    const { likeStore, likeDispatch } = useLikeReducer();
    const { userLikes } = likeStore;
    const { userStore } = useUserReducer();
    const currentUser = userStore?.user?.id;
    const liked = userLikes.some((like) => like.project_id === project.id);


    const handleLikeToggle = async () => {
        try {
            await toggleProjectLike(project.id);
            if (!currentUser) {
                return;
            }
            const updatedLikes = await getUserLikes(currentUser);

            likeDispatch({ type: "set_user_likes", payload: updatedLikes });
        } catch (err) {
            console.error("❌ Error al dar like:", err);
        }
    };

    console.log(`🎯 Renderizando ProjectCard ${project.id} - liked: ${liked}`);


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

                <div className="collaborators_container">
                    {Array.isArray(project.collaborators) && project.collaborators.length > 0 ? (
                        project.collaborators.map((colab) => (
                            <div key={colab.id} className="collaborator_avatar">
                                <img
                                    src={colab.profile_pic_url}
                                    alt={colab.username}
                                    className="profile_pic_project_card"
                                />
                                <span className="owner_username">{colab.username}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no_collaborators_text">Este proyecto no tiene colaboradores de momento.</p>
                    )}

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
