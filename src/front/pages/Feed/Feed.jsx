import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { useProjectReducer } from '../../reducers/projectReducer';
import { FeedSidebar } from '../../components/FeedSidebar/FeedSidebar';
import { ProjectCard } from '../../components/ProjectCard/ProjectCard';
import { Loader } from "../../components/Loader/Loader.jsx"
import ChatSidebar from '../../components/ChatSidebar/ChatSidebar';
import "./feed.css"

export const Feed = () => {
    const { projectStore, fetchPublicProjects } = useProjectReducer();
    const { projects, loading, error } = projectStore;

    useEffect(() => {
        fetchPublicProjects();
    }, []);

    if (loading) return <><p className="text-white text-center mt-5 fs-1">Loading projects!</p></>;

    if (error) 
        
        return <>
        <div className="d-flex flex-column align-items-center gap-3">

        <p className="no-user text-center mt-5">No User connected!</p>

        <Link to="/" className="text-decoration-none"> <button className="text-white jazz-back" >Jazz-back and log in!</button> </Link>
        </div>
        </>;

    else
        return (
            <>
                <div className="container-fluid my-5">

                    <div className="row">
                        <p className="header-feed text-center display-1 fw-bold">Lets make some noise!</p>
                    </div>

                    <div className="row feed_container pb-5">

                        <div className="col-3 feed_userSidebar_container pb-5">

                            <FeedSidebar />

                        </div>

                        <div className="col-6 feed_projects_container pb-5 d-flex flex-column-reverse justify-content-end">

                            {projects?.map((project) => (<ProjectCard key={project.id} project={project} />))}

                        </div>

                        <div className="col-3 z-2 feed_userSidebar_container pb-5">

                            <ChatSidebar />

                        </div>
                    </div>
                </div>
            </>
        );
};
