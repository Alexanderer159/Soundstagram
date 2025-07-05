// services/collaboratorService.js
import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const getCollaborators = async (projectId) => {
  try {
    const response = await axios.get(
      `${API_URL}/projects/${projectId}/collaborators`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener colaboradores:', error.response?.data || error.message);
    throw error.response?.data?.msg || 'Error al obtener colaboradores';
  }
};
