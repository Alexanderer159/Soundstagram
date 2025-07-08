import React from 'react';
import { useUserReducer } from '../reducers/userReducer';
import '../styles/usersidebar.css';

export const UserSidebar = () => {

    const { userStore } = useUserReducer();
    const { user } = userStore;

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg w-full md:w-72">
            <div className="userSidebar_header text-center">
                <img
                    src={user.profile_pic_url}
                    alt={user.username}
                    className="sidebar_profile_pic"
                />
                <h2 className="mt-2 text-lg font-semibold">{user.username}</h2>
            </div>

            {user.spotify_playlist && (

                <div className="spotify_link">
                    <a
                        href={user.spotify_playlist}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify_link"
                    >
                        Ver Playlist en Spotify
                    </a>
                </div>
            )}


            <hr className="my-4 border-gray-700" />

            <div className='roles_instruments_container'>
                <div className=''>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Roles:</h3>
                    <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                            <span
                                key={role.id}
                                className="role-pill"
                            >
                                {role.name}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="">
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Instrumentos:</h3>
                    <div className="pill_container">
                        {user.instruments?.map((instrument) => (
                            <span
                                key={instrument.id}
                                className="role-pill"
                            >
                                {instrument.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};