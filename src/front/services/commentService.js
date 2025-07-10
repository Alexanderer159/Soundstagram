import api from './authService';

export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};

export const getCommentsForTrack = async (trackId) => {
  const response = await api.get(`/comments/track/${trackId}`);
  return response.data;
};

export const getCommentsForProject = async (projectId) => {
  const response = await api.get(`/comments/project/${projectId}`);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
