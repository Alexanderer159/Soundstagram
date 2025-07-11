// src/components/UserSidebar/FilterForm.jsx
import React, { useEffect, useState } from 'react';
import {
    getProjectsByGenre,
    getProjectsBySeekingRole,
    getProjectsBySeekingInstrument,
    getProjectsFromFollowedUsers
} from '../../services/projectService';
import api from '../../services/authService';
import { useUserReducer } from '../../reducers/userReducer';
import { useProjectReducer } from '../../reducers/projectReducer';
import './FilterForm.css';

const FilterForm = () => {
    const { userStore } = useUserReducer();
    const { user } = userStore;
    const { projectDispatch, fetchPublicProjects } = useProjectReducer();

    const [genres, setGenres] = useState([]);
    const [roles, setRoles] = useState([]);
    const [instruments, setInstruments] = useState([]);

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedInstruments, setSelectedInstruments] = useState([]);
    const [onlyFollowed, setOnlyFollowed] = useState(false);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            const resGenres = await api.get('/genres');
            const resRoles = await api.get('/roles');
            const resInstruments = await api.get('/instruments');
            setGenres(resGenres.data);
            setRoles(resRoles.data);
            setInstruments(resInstruments.data);
        };
        fetchFilterOptions();
    }, []);

    const handleCheckboxChange = (id, list, setList) => {
        setList(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const applyFilters = async () => {
        let results = [];

        if (onlyFollowed) {
            const followed = await getProjectsFromFollowedUsers(user.id);
            results.push(followed);
        }

        const genreResults = await Promise.all(
            selectedGenres.map(id => getProjectsByGenre(id))
        );
        const roleResults = await Promise.all(
            selectedRoles.map(id => getProjectsBySeekingRole(id))
        );
        const instrumentResults = await Promise.all(
            selectedInstruments.map(id => getProjectsBySeekingInstrument(id))
        );

        results.push(...genreResults, ...roleResults, ...instrumentResults);

        // Combinar todos los resultados (podrías aplicar intersección si se desea filtrar estrictamente)
        const merged = results.flat();
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());

        projectDispatch({ type: 'set_projects', payload: unique });
    };

    const resetFilters = () => {
        setSelectedGenres([]);
        setSelectedRoles([]);
        setSelectedInstruments([]);
        setOnlyFollowed(false);
        fetchPublicProjects();
    };

    return (
    <>
        <div className="container-fluid">

            <div className="row my-3">

                <details className="dropdown_section">

                    <summary className="fs-4">Filter by genre</summary>

                    <div className="filter_container my-2">

                        {genres.map(genre => (<label key={genre.id} className="filter_checkbox">

                            <input hidden className="input-box-feed" type="checkbox" checked={selectedGenres.includes(genre.id)} onChange={() => handleCheckboxChange(genre.id, selectedGenres, setSelectedGenres)}/>
                            <p className="inside-button p-0 m-0">{genre.name}</p>
                        
                        </label>))}

                    </div>
                </details>

            </div>
        
            <div className="row my-3">

                <details className="dropdown_section">

                    <summary className="fs-4">Filter by roles</summary>

                    <div className="filter_container my-2">

                        {roles.map(role => (<label key={role.id} className="filter_checkbox">

                        <input hidden className="input-box-feed" type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => handleCheckboxChange(role.id, selectedRoles, setSelectedRoles)} />

                        <p className="inside-button p-0 m-0">{role.name}</p>

                        </label>))}

                    </div>
                </details>

            </div>

            <div className="row my-3">

                <details className="dropdown_section">

                    <summary className="fs-4">Filter by instruments</summary>

                    <div className="filter_container my-2">

                    {instruments.map(inst => (<label key={inst.id} className="filter_checkbox">
                        
                        <input hidden className="input-box-feed" type="checkbox" checked={selectedInstruments.includes(inst.id)} onChange={() => handleCheckboxChange( inst.id, selectedInstruments, setSelectedInstruments) } />

                        <p className="inside-button p-0 m-0">{inst.name}</p>

                        </label>))}

                    </div>
                </details>

            </div>

            <label className="filter_checkbox my-3 w-100">

                <input hidden className="input-box-feed" type="checkbox" checked={onlyFollowed} onChange={() => setOnlyFollowed(!onlyFollowed)}/> 
                <p className="inside-button p-0 m-0 people-follow text-center w-100">Show only projects of people you follow</p>
                
            </label>

            <div className="filter_buttons d-flex justify-content-between my-3">

                <button onClick={applyFilters} className="filter_btn apply">Apply filters</button>

                <button onClick={resetFilters} className="filter_btn reset">Reset filters</button>

            </div>
        
        </div>
    </>
    );
};

export default FilterForm;
