import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api/genres`;

export const getAllGenres = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const getGenreById = async (id) => {
  const response = await axios.get(`${API}/${id}`);
  return response.data;
};

export const createGenre = async (name) => {
  const response = await axios.post(API, { name });
  return response.data;
};

export const updateGenre = async (id, name) => {
  const response = await axios.put(`${API}/${id}`, { name });
  return response.data;
};

export const deleteGenre = async (id) => {
  const response = await axios.delete(`${API}/${id}`);
  return response.data;
};
