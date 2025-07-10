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
        <div className="filters_section">
            <h3 className="text-sm font-bold mt-4">Filtrar por género:</h3>
            <div className='filter_container'>
                {genres.map(genre => (
                    <label key={genre.id} className="filter_checkbox">
                        <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() =>
                                handleCheckboxChange(genre.id, selectedGenres, setSelectedGenres)
                            }
                        />
                        {genre.name}
                    </label>
                ))}
            </div>

            <h3 className="text-sm font-bold mt-4">Filtrar por roles buscados:</h3>
            <div className='filter_container'>
                {roles.map(role => (
                    <label key={role.id} className="filter_checkbox">
                        <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() =>
                                handleCheckboxChange(role.id, selectedRoles, setSelectedRoles)
                            }
                        />
                        {role.name}
                    </label>
                ))}
            </div>

            <h3 className="text-sm font-bold mt-4">Filtrar por instrumentos buscados:</h3>
            <div className='filter_container'>
                {instruments.map(inst => (
                    <label key={inst.id} className="filter_checkbox">
                        <input
                            type="checkbox"
                            checked={selectedInstruments.includes(inst.id)}
                            onChange={() =>
                                handleCheckboxChange(inst.id, selectedInstruments, setSelectedInstruments)
                            }
                        />
                        {inst.name}
                    </label>
                ))}
            </div>

            <label className="filter_checkbox mt-3">
                <input
                    type="checkbox"
                    checked={onlyFollowed}
                    onChange={() => setOnlyFollowed(!onlyFollowed)}
                />
                Solo mostrar proyectos de personas que sigues
            </label>

            <div className="filter_buttons mt-4">
                <button onClick={applyFilters} className="filter_btn apply">
                    Aplicar filtros
                </button>
                <button onClick={resetFilters} className="filter_btn reset">
                    Resetear filtros
                </button>
            </div>
        </div>
    );
};

export default FilterForm;
