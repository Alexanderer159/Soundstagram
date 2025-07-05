import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/projects`;

export const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData, getAuthHeader());
  return response.data;
};

export const getPublicProjects = async () => {
  const response = await axios.get(`${API_URL}/public`, getAuthHeader());
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeader());
  return response.data;
};

export const updateProject = async (projectId, updatedData) => {
  const response = await axios.put(`${API_URL}/${projectId}`, updatedData, getAuthHeader());
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await axios.delete(`${API_URL}/${projectId}`, getAuthHeader());
  return response.data;
};

export const getProjectsBySeekingInstrument = async (instrumentId) => {
  const response = await axios.get(`${API_URL}/seeking-instrument/${instrumentId}`);
  return response.data;
};

export const getProjectsBySeekingRole = async (roleId) => {
  const response = await axios.get(`${API_URL}/seeking-role/${roleId}`);
  return response.data;
};

export const getProjectsByGenre = async (genreId) => {
  const response = await axios.get(`${API}/projects/by-genre/${genreId}`);
  return response.data;
};
