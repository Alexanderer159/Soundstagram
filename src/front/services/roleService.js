import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const getRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener roles';
  }
};

export const getInstruments = async () => {
  try {
    const response = await axios.get(`${API_URL}/instruments`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener instrumentos:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener instrumentos';
  }
};
