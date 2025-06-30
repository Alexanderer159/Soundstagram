import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const registerUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
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

export const getProjectsByUser = async (userId) => {
  try {
    const url = `${API_URL}/projects/user/${userId}`;
    console.log('Llamando a:', url);
    console.log(getAuthHeader());
    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos del usuario:', error.response?.data || error);
    return [];
  }
};

export const getTracksByUser = async (userId) => {
  try {
    const url = `${API_URL}/users/${userId}/tracks`;
    console.log('Llamando a:', url);
    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener tracks del usuario:', error.response?.data || error);
    return [];
  }
};
