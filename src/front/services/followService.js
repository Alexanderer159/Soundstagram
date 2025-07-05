import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const followUser = async (userId) => {
  const response = await axios.post(`${API_URL}/follow/${userId}`, {}, getAuthHeader());
  return response.data;
};

export const getFollowers = async (userId) => {
  const response = await axios.get(`${API_URL}/followers/${userId}`, getAuthHeader());
  return response.data;
};

export const getFollowing = async (userId) => {
  const response = await axios.get(`${API_URL}/following/${userId}`);
  return response.data;
};
