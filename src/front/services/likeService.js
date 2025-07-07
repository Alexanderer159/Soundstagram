import api from './authService';

export const toggleTrackLike = async (trackId) => {
  const response = await api.post(`/likes/track/${trackId}`, {});
  return response.data;
};

export const toggleProjectLike = async (projectId) => {
  const response = await api.post(`/likes/project/${projectId}`, {});
  return response.data;
};

export const getUserLikes = async (userId) => {
  const response = await api.get(`/likes/user/${userId}`);
  console.log('📦 getUserLikes response:', response.data); // AÑADE ESTO
  return response.data;
};
export const getLikesForTrack = async (trackId) => {
  const response = await api.get(`/likes/track/${trackId}`);
  return response.data;
};

export const getLikesForProject = async (projectId) => {
  const response = await api.get(`/likes/project/${projectId}`);
  return response.data;
};
