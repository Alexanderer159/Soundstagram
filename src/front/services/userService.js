// services/userService.js
import axios from 'axios';
import { getAuthHeader } from './authServices';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`;

export const getAllUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateUser = async (id, updatedData) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData, getAuthHeader());
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const getUsersByRole = async (roleId) => {
  const response = await axios.get(`${API_URL}/role/${roleId}`);
  return response.data;
};

export const getUsersByInstrument = async (instrumentId) => {
  const response = await axios.get(`${API_URL}/instrument/${instrumentId}`);
  return response.data;
};
