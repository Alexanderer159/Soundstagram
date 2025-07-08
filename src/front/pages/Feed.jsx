import React, { useEffect } from 'react';
import { useProjectReducer } from '../reducers/projectReducer';
import { UserSidebar } from '../components/UserSidebar';
import { ProjectCard }from '../components/ProjectCard';
import "../styles/feed.css"

export const Feed = () => {
    const { projectStore, fetchPublicProjects } = useProjectReducer();
    const { projects, loading, error } = projectStore;

    useEffect(() => {
        fetchPublicProjects();
    }, []);

    if (loading) return <p className="text-white text-center mt-5">Cargando proyectos...</p>;
    if (error) return <p className="text-danger text-center mt-5">Error: {error}</p>;

    return (
        <>
            <div className='feed_container d-flex'>
                <div className='feed_userSidebar_container d-flex flex-column'>
                    <UserSidebar />
                </div>
                <div className="feed_projects_container d-flex flex-column">
                    {projects?.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </>
    );
};
