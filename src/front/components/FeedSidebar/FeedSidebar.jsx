import React from 'react';
import { useUserReducer } from '../../reducers/userReducer';
import { Link, useNavigate } from "react-router-dom";
import './/feedsidebar.css';
import FilterForm from '../FilterForm/FilterForm';

export const FeedSidebar = () => {

    const navigate = useNavigate()

    const { userStore } = useUserReducer();
    const { user } = userStore;

        const handleGoNewProject = () =>{
        navigate(`/add_project`);
    }

    return (
        <>
            <div className="feed-sidebar container-fluid">

                <div className="all-info-user p-4 text-white">

                    <div className="row">

                        <div className="d-flex justify-content-center">

                            <Link to={`/profile/${user.username}`}>
                            
                                <img src={user.profile_pic_url} className="sidebar_profile_pic rounded-circle object-fit-cover" />

                            </Link>

                        </div>

                    </div>

                <div className="row">

                    <p className="text-center fs-3">{user.username}</p>

                </div>

                <div className="row spot-proj pb-4">

                    <div className="col d-flex flex-column gap-3 align-items-center">

                        <a href={user.spotify_playlist} target="_blank" rel="noopener noreferrer" className="spotify_link text-center" >See Spotify Playlist</a>

                        <button className='make-project' onClick={handleGoNewProject}>Make a new Project!</button>

                    </div>

                </div>    

                <div className="roles-inst row pb-4 d-flex justify-content-between">

                    <div className="col">

                        <p className="fs-3 text-center">Roles</p>

                        <div className="d-flex justify-content-center">

                            {user.roles?.map((role) => (<span key={role.id} className="role-pill py-1 px-2" > {role.name} </span>))}

                        </div>
                    </div>

                    <div className="col">

                        <p className="fs-3 text-center">Instruments</p>

                        <div className="d-flex justify-content-center">

                            {user.instruments?.map((instrument) => (<span key={instrument.id} className="role-pill py-1 px-2" > {instrument.name} </span>))}

                        </div>
                    </div>
                </div>

                <FilterForm />

                </div>
            </div>
        </>
    );
};