import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser, getRoles, getInstruments } from '../service/services';
import defaultPic from '../assets/default-profile.png';
import { uploadToCloudinary } from '../service/cloudinaryService';
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

                <div className="row justify-content-between">

                    <div className="col imacombo object-fit-cover">

                        <img src={profilePicPreview} className="reguserim rounded-circle" onClick={() => fileInputRef.current.click()}/>
                        <input type="file" name="profile_pic_file" accept="image/*" onChange={handleChange} ref={fileInputRef} className="d-none"/>

                    </div>

                    <div classname="col">

                        <form onSubmit={handleSubmit} className="">
                            <input name="email" type="email" placeholder="Correo electrónico" onChange={handleChange} required className="" />
                            <input name="username" type="text" placeholder="Nombre de usuario" onChange={handleChange} required className="" />
                            <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="" />
                            <input name="confirmPassword" type="password" placeholder="Confirmar contraseña" onChange={handleChange} required className="" />
                            <textarea name="bio" placeholder="Bio" onChange={handleChange} className="" />

                    {/* ROLES */}
                    <div className="">
                        <div className="">
                            {formData.roles.map(roleId => {
                                const role = rolesList.find(r => r.id === roleId);
                                return (
                                    <button key={role.id} type="button" className="" onClick={() => removeSelected(roleId, 'roles')}> {role?.name} </button>
                                );
                            })}
                        </div>
                        <select onChange={(e) => handleSelect(e, 'roles')} className="">
                            <option value="">Selecciona un rol</option>
                            {rolesList.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* INSTRUMENTOS */}
                    <div className="col-span-1">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.instruments.map(instrId => {
                                const instr = instrumentsList.find(i => i.id === instrId);
                                return (
                                    <button key={instrId} className="bg-purple-600 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                                        type="button" onClick={() => removeSelected(instrId, 'instruments')}>
                                        {instr?.name}
                                    </button>
                                );
                            })}
                        </div>
                        <select onChange={(e) => handleSelect(e, 'instruments')} className="input-style">
                            <option value="">Selecciona un instrumento</option>
                            {instrumentsList.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>

                    <input name="spotify_playlist" type="url" placeholder="Enlace de Spotify Playlist" onChange={handleChange} className="input-style col-span-2" />

                    <button type="submit" className="col-span-2 bg-green-600 hover:bg-green-700 transition py-2 rounded font-bold text-center">
                        Registrarse
                    </button>
                </form>
                </div>
                </div>
        </div>
    );
};
