import api from './authService';

export const getAllUsers = async () => {
  const response = await api.get(`/users`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, updatedData) => {
  const response = await api.put(`/users/${id}`, updatedData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getUsersByRole = async (roleId) => {
  const response = await api.get(`/users/role/${roleId}`);
  return response.data;
};

export const getUserByUsername = async (username) => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

export const getUsersByInstrument = async (instrumentId) => {
  const response = await api.get(`/users/instrument/${instrumentId}`);
  return response.data;
};

export const getProjectsByUser = async (userId) => {
  try {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos del usuario:', error.response?.data || error);
    return [];
  }
};

export const getTracksByUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/tracks`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tracks del usuario:', error.response?.data || error);
    return [];
  }
};
