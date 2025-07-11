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
        <>
            <div className='container-fluid project_card text-white p-4'>

                <div className="row">

                    <div className="col-4 project_card_header d-flex flex-column justify-content-between gap-3">

                        <div className="owner_container d-flex flex-row gap-3 align-items-center">

                                <img src={project.owner_pic} className="profile_pic_project_card rounded-circle object-fit-cover"/>

                                <span className="owner_username fs-4">{project.owner_username}</span>

                            </div>

                        <div>

                            <p className="fs-4">Description</p>
                            <p className="fs-5">{project.description}</p>

                        </div>


                    </div>

                    <div className="col-4 d-flex flex-column justify-content-between gap-3">

                        <div className="d-flex flex-column justify-content-center align-items-center">
                                
                            <p className="project-title-feed text-center fs-1">{project.title}</p>

                        </div>

                            <div className="d-flex justify-content-center flex-column">

                                <p className="d-flex justify-content-center fs-5">Genre</p>

                                <div className="d-flex justify-content-center">

                                    {project.genres.map((g) => (<span key={g.id} className="pill text-center p-2">{g.name}</span>))}

                                </div>

                            </div>

                        <div className="d-flex flex-column gap-3 align-items-center ">

                            Looking for
                            <div className="d-flex flex-row gap-1">
                            {project.seeking_roles.map((r) => (<span key={r.id} className="pill text-center m-0 p-2">{r.name}</span>))}

                            {project.seeking_instruments.map((i) => (<span key={i.id} className="pill text-center m-0 p-2">{i.name}</span>))}
                            </div>

                        </div>

                    </div>

                    <div className="col-4 d-flex flex-column justify-content-between gap-4">

                        <div className="especifications_container d-flex justify-content-center gap-5">

                            <div className='project_especifications'>
                                <span className="font-bold">BPM</span> 
                                {project.bpm}
                                </div>

                            <div className='project_especifications'>
                                <span className="font-bold ml-2">Key</span> 
                                {project.key}
                                </div>

                            <div className='project_especifications'>
                                <span className="font-bold ml-2">Meter</span> 
                                {project.meter}
                                </div>

                        </div>

                        
                        <div className="collaborators_container d-flex justify-content-center align-items-center flex-column">

                        <p>Collaborators</p>

                        <div className="d-flex flex-row justify-content-between">

                            {Array.isArray(project.collaborators) && project.collaborators.length > 0 ? (project.collaborators.map((colab) => (

                                    <div key={colab.id} className="collaborator_avatar">

                                        <img src={colab.profile_pic_url} className="profile_pic_project_card rounded-circle object-fit-cover" />

                                    </div>

                                ))) : (

                                <p className="no_collaborators_text">This project has no collaborators yet!</p>)}

                        </div>        

                        </div>

                        <div className="d-flex justify-content-center">
                            <button className={`like_button ${liked ? 'liked' : ''}`} onClick={handleLikeToggle}>{liked ? '💚' : '🤍'}</button>
                        </div>

                    </div>

                    </div>   
            </div>
        </>
    );
};
