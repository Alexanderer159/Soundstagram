import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const createTrack = async (trackData) => {
  const response = await axios.post(`${API_URL}/tracks`, trackData, getAuthHeader());
  return response.data;
};

export const getTrackById = async (trackId) => {
  const response = await axios.get(`${API_URL}/tracks/${trackId}`, getAuthHeader());
  return response.data;
};

export const getTracksByProject = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/projects/${projectId}/tracks`,
    getAuthHeader()
  );
  return response.data;
};

export const updateTrack = async (trackId, updatedData) => {
  const response = await axios.put(`${API_URL}/tracks/${trackId}`, updatedData, getAuthHeader());
  return response.data;
};

export const deleteTrack = async (trackId) => {
  const response = await axios.delete(`${API_URL}/tracks/${trackId}`, getAuthHeader());
  return response.data;
};

export const approveTrack = async (trackId) => {
  const response = await axios.put(`${API_URL}/tracks/${trackId}/approve`, {}, getAuthHeader());
  return response.data;
};
export const rejectTrack = async (trackId) => {
  const response = await axios.put(`${API_URL}/tracks/${trackId}/reject`, {}, getAuthHeader());
  return response.data;
};
