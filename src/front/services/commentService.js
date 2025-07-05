import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/comments`;

export const createComment = async (commentData) => {
  const response = await axios.post(API_URL, commentData, getAuthHeader());
  return response.data;
};

export const getCommentsForTrack = async (trackId) => {
  const response = await axios.get(`${API_URL}/track/${trackId}`);
  return response.data;
};

export const getCommentsForProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}`);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(`${API_URL}/${commentId}`, getAuthHeader());
  return response.data;
};