import api from './authService';

export const getRoles = async () => {
  try {
    const response = await api.get(`/roles`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener roles';
  }
};

export const getInstruments = async () => {
  try {
    const response = await api.get(`/instruments`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener instrumentos:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener instrumentos';
  }
};
