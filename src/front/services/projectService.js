import api from './authService'; // cliente axios con interceptor

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const getPublicProjects = async () => {
  const response = await api.get('/projects/public');
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId, updatedData) => {
  const response = await api.put(`/projects/${projectId}`, updatedData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const getProjectsBySeekingInstrument = async (instrumentId) => {
  const response = await api.get(`/projects/seeking-instrument/${instrumentId}`);
  return response.data;
};

export const getProjectsBySeekingRole = async (roleId) => {
  const response = await api.get(`/projects/seeking-role/${roleId}`);
  return response.data;
};

export const getProjectsByGenre = async (genreId) => {
  const response = await api.get(`/projects/by-genre/${genreId}`);
  return response.data;
};
