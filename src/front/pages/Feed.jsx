import React, { useEffect } from 'react';
import { useProjectReducer } from '../reducers/projectReducer';
import { FeedSidebar } from '../components/FeedSidebar';
import { ProjectCard } from '../components/ProjectCard';
import "../styles/feed.css"

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
                <div className="container-fluid m-5">

                    <div className="row feed_container">

                        <div className="col-3 feed_userSidebar_container">

                            <FeedSidebar />

                        </div>

                        <div className="col-6 feed_projects_container">

                            {projects?.map((project) => (<ProjectCard key={project.id} project={project} />))}

                        </div>
                    </div>
                </div>
            </>
        );
};
