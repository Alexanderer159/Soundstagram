import api from './authService';

export const createTrack = async (trackData) => {
  const response = await api.post(`/tracks`, trackData);
  return response.data;
};

export const getTrackById = async (trackId) => {
  const response = await api.get(`/tracks/${trackId}`);
  return response.data;
};

export const updateTrack = async (trackId, updatedData) => {
  const response = await api.put(`/tracks/${trackId}`, updatedData);
  return response.data;
};

export const deleteTrack = async (trackId) => {
  const response = await api.delete(`/tracks/${trackId}`);
  return response.data;
};

export const approveTrack = async (trackId) => {
  const response = await api.put(`/tracks/${trackId}/approve`, {});
  return response.data;
};
export const rejectTrack = async (trackId) => {
  const response = await api.put(`/tracks/${trackId}/reject`, {});
  return response.data;
};
