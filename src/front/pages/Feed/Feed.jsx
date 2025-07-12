import React, { useEffect } from 'react';
import { useProjectReducer } from '../../reducers/projectReducer';
import { FeedSidebar } from '../../components/FeedSidebar/FeedSidebar';
import { ProjectCard } from '../../components/ProjectCard/ProjectCard';
import "./feed.css"
import ChatSidebar from '../../components/ChatSidebar/ChatSidebar';

export const Feed = () => {
    const { projectStore, fetchPublicProjects } = useProjectReducer();
    const { projects, loading, error } = projectStore;

    useEffect(() => {
        fetchPublicProjects();
    }, []);

    if (loading) return <p className="text-white text-center mt-5">Cargando proyectos...</p>;

    if (error) return <p className="text-danger text-center mt-5">Error: {error}</p>;

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
