import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api` || 'http://127.0.0.1:3001/api';

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

    const { token, user } = response.data;
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
};
