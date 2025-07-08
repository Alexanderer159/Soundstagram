import React, { useEffect } from 'react';
import { useProjectReducer } from '../../reducers/projectReducer';
import UserSidebar from '../../components/UserSidebar/UserSidebar';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import './feed.css'

const Feed = () => {
    const { projectStore, fetchPublicProjects } = useProjectReducer();
    const { projects, loading, error } = projectStore;

    useEffect(() => {
        fetchPublicProjects();
    }, []);

    if (loading) return <p className="text-white text-center mt-10">Cargando proyectos...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;

    return (
        <>
            <div className='feed_container'>
                <div className='feed_userSidebar_container'>
                    <UserSidebar />
                </div>
                <div className="feed_projects_container">
                    {projects?.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Feed;
