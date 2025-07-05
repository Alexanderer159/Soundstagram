import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const registerUser = async ({
  email,
  password,
  confirmPassword,
  username,
  bio,
  roles,
  instruments,
  profile_pic_url,
  spotify_playlist,
}) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      confirmPassword,
      username,
      bio,
      roles: Array.isArray(roles) ? roles : roles.split(',').map((r) => r.trim()),
      instruments: Array.isArray(instruments)
        ? instruments
        : instruments.split(',').map((i) => i.trim()),
      profile_pic_url,
      spotify_playlist,
    });

    return response.data;
  } catch (error) {
    console.error('Error en el registro:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al registrar';
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    console.log('response', response);
    const { access_token: token, user } = response.data;
    console.log('token', token);
    localStorage.setItem('token', token);

    return { token, user };
  } catch (error) {
    console.error('Error en el login:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al iniciar sesión';
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

