import api from './authService'; // cliente axios con interceptor

export const getAllGenres = async () => {
  const response = await api.get('/genres');
  return response.data;
};

export const getGenreById = async (id) => {
  const response = await api.get(`/genres/${id}`);
  return response.data;
};

export const createGenre = async (name) => {
  const response = await api.post('/genres', { name });
  return response.data;
};

export const updateGenre = async (id, name) => {
  const response = await api.put(`/genres/${id}`, { name });
  return response.data;
};

export const deleteGenre = async (id) => {
  const response = await api.delete(`/genres/${id}`);
  return response.data;
};
