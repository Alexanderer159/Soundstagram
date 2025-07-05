import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/users/${id}`);
  return response.data;
};

export const updateUser = async (id, updatedData) => {
  const response = await axios.put(`${API_URL}/users/${id}`, updatedData, getAuthHeader());
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, getAuthHeader());
  return response.data;
};

export const getUsersByRole = async (roleId) => {
  const response = await axios.get(`${API_URL}/users/role/${roleId}`);
  return response.data;
};

export const getUsersByInstrument = async (instrumentId) => {
  const response = await axios.get(`${API_URL}/users/instrument/${instrumentId}`);
  return response.data;
};

export const getProjectsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/projects/user/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos del usuario:', error.response?.data || error);
    return [];
  }
};

export const getTracksByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/tracks`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener tracks del usuario:', error.response?.data || error);
    return [];
  }
};
