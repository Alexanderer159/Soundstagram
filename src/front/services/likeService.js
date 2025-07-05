import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const toggleTrackLike = async (trackId) => {
  const response = await axios.post(`${API_URL}/likes/track/${trackId}`, {}, getAuthHeader());
  return response.data;
};

export const toggleProjectLike = async (projectId) => {
  const response = await axios.post(`${API_URL}/likes/project/${projectId}`, {}, getAuthHeader());
  return response.data;
};

export const getUserLikes = async (userId) => {
  const response = await axios.get(`${API_URL}/likes/user/${userId}`, getAuthHeader());
  return response.data;
};

export const getLikesForTrack = async (trackId) => {
  const response = await axios.get(`${API_URL}/likes/track/${trackId}`);
  return response.data;
};

export const getLikesForProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/likes/project/${projectId}`);
  return response.data;
};
