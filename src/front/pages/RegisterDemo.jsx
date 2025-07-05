import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../services/authService';
import { getRoles, getInstruments } from '../services/roleService';
import defaultPic from '../assets/default-profile.png';
import { uploadToCloudinary } from '../services/cloudinaryService';
import "../styles/register.css"
import "../styles/index.css"

export const RegisterDemo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [rolesList, setRolesList] = useState([]);
    const [instrumentsList, setInstrumentsList] = useState([]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        bio: '',
        roles: [],
        instruments: [],
        profile_pic_file: null,
        spotify_playlist: ''
    });

    useEffect(() => {
        const getRolesAndInstruments = async () => {
            try {
                const roles = await getRoles();
                const instruments = await getInstruments();
                setRolesList(roles);
                setInstrumentsList(instruments);
            } catch (error) {
                toast.error('No se pudieron cargar roles o instrumentos');
            }
        };

        getRolesAndInstruments();
    }, []);


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files?.length > 0 ? files[0] : value
        }));
    };

    const handleSelect = (e, type) => {
        const value = parseInt(e.target.value);
        if (!formData[type].includes(value)) {
            setFormData(prev => ({
                ...prev,
                [type]: [...prev[type], value]
            }));
        }
    };

    const removeSelected = (id, type) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Las contraseñas no coinciden');
        }

        try {
            let profile_pic_url = '';
            if (formData.profile_pic_file) {
                profile_pic_url = await uploadToCloudinary(formData.profile_pic_file);
            }

            const payload = {
                ...formData,
                profile_pic_url,
            };
            delete payload.profile_pic_file;
            delete payload.confirmPassword;

            console.log('Payload enviado:', payload);

            const response = await registerUser(payload);
            toast.success(response.msg || 'Usuario registrado correctamente');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error?.message || 'Error al registrar el usuario');
        }
    };

    const profilePicPreview = formData.profile_pic_file
        ? URL.createObjectURL(formData.profile_pic_file)
        : defaultPic;

    return (
        <div className="container-fluid pt-5">
            <div className="row">
                <p className="get-started text-center">Lets get you started!</p>
            </div>

            <div className="row justify-content-center align-items-center gap-5">

                <div className="col d-flex justify-content-end">
                    <img src={profilePicPreview} className="reguserim rounded-circle" onClick={() => fileInputRef.current.click()} />
                    <input type="file" name="profile_pic_file" accept="image/*" onChange={handleChange} ref={fileInputRef} className="d-none" />
                </div>

                <div className="col">

                    <form onSubmit={handleSubmit} className="register-form d-flex flex-column gap-2 p-4 shadow-lg">

                        <input name="email" type="email" placeholder="E-mail" onChange={handleChange} required className="register-input" />

                        <input name="username" type="text" placeholder="Username" onChange={handleChange} required className="register-input" />

                        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="register-input" />

                        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="register-input" />

                        <textarea name="bio" placeholder="Tell us about you!" onChange={handleChange} className="register-input" rows="4" />

                        <div className="register-selects d-flex justify-content-between">

                            <select onChange={(e) => handleSelect(e, 'roles')} className="register-input">
                                <option value="">What's your role?</option>

                                {rolesList.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}

                                {formData.roles.map(roleId => {
                                    const role = rolesList.find(r => r.id === roleId); return (
                                        <button key={role.id} type="button" className="register-input" onClick={() => removeSelected(roleId, 'roles')}> {role?.name} </button>);
                                })}

                            </select>

                            <select onChange={(e) => handleSelect(e, 'instruments')} className="register-input">

                                <option value="">What's your instrument?</option>

                                {instrumentsList.map(inst => (<option key={inst.id} value={inst.id}>{inst.name}</option>))}

                                {formData.instruments.map(instrId => {
                                    const instr = instrumentsList.find(i => i.id === instrId); return (
                                        <button key={instrId} className="register-input" type="button" onClick={() => removeSelected(instrId, 'instruments')}>{instr?.name}</button>);
                                })}

                            </select>

                        </div>

                        <input name="spotify_playlist" type="url" placeholder="Spotify Playlist Link" onChange={handleChange} className="register-input" />

                        <div className="d-flex justify-content-center text-center align-items-center">
                            <button type="submit" className="register-btn" >Create Account!</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
