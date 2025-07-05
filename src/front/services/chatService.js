import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const getUserChats = async () => {
  const response = await axios.get(`${API_URL}/chats`, getAuthHeader());
  return response.data;
};

export const getChatMessages = async (chatId) => {
  const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, getAuthHeader());
  return response.data;
};

export const sendMessageToUser = async (otherUserId, content) => {
  const response = await axios.post(
    `${API_URL}/chats/${otherUserId}/messages`,
    { content },
    getAuthHeader()
  );
  return response.data;
};
