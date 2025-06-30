import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../service/services';
import defaultPic from '../assets/default-profile.png';

export const RegisterDemo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        full_name: '',
        bio: '',
        roles: '',
        instruments: '',
        profile_pic_file: null,
        spotify_playlist: ''
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files?.length > 0 ? files[0] : value
        }));
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Las contraseñas no coinciden');
        }

        try {
            const response = await registerUser(formData);
            toast.success(response.msg || 'Usuario registrado correctamente');
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error(error || 'Error al registrar el usuario');
        }
    };

    const profilePicPreview = formData.profile_pic_file
        ? URL.createObjectURL(formData.profile_pic_file)
        : defaultPic;

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-900 text-white py-10 px-10">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8 flex gap-10 w-full max-w-5xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative" style={{ width: '15%' }}>
                        <img
                            src={profilePicPreview}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover rounded-full border-2 border-white cursor-pointer hover:opacity-80 transition"
                            onClick={handleImageClick}
                        />
                        <input
                            type="file"
                            name="profile_pic_file"
                            accept="image/*"
                            onChange={handleChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-2 gap-4">
                    <input name="email" type="email" placeholder="Correo electrónico" onChange={handleChange} required className="input-style" />
                    <input name="username" type="text" placeholder="Nombre de usuario" onChange={handleChange} className="input-style" />
                    <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="input-style" />
                    <input name="confirmPassword" type="password" placeholder="Confirmar contraseña" onChange={handleChange} required className="input-style" />
                    <textarea name="bio" placeholder="Bio" onChange={handleChange} className="input-style col-span-2 h-20 resize-none" />
                    <input name="instruments" type="text" placeholder="Instrumentos (separados por coma)" onChange={handleChange} required className="input-style" />
                    <input name="roles" type="text" placeholder="Roles (separados por coma)" onChange={handleChange} required className="input-style" />
                    <input name="spotify_playlist" type="url" placeholder="Enlace de Spotify Playlist" onChange={handleChange} className="input-style col-span-2" />

                    <button type="submit" className="col-span-2 bg-green-600 hover:bg-green-700 transition py-2 rounded font-bold text-center">
                        Registrarse
                    </button>
                </form>
            </div>
        </div>
    );
};
