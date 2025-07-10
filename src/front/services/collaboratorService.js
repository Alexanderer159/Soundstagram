import api from './authService';

export const getCollaborators = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/collaborators`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener colaboradores:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener colaboradores';
  }
};
