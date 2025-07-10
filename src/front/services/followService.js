import axios from 'axios';
import api from './authService';

export const toggleFollowUser = async (userId) => {
  const response = await api.post(`/follow/${userId}`, {});
  return response.data;
};

export const getFollowers = async (userId) => {
  const response = await api.get(`/followers/${userId}`);
  return response.data;
};

export const getFollowing = async (userId) => {
  const response = await api.get(`/following/${userId}`);
  return response.data;
};
