import api from './authService';

export const getUserChats = async () => {
  const response = await api.get(`/chats`);
  return response.data;
};

export const getChatMessages = async (chatId) => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
};

export const sendMessageToUser = async (otherUserId, content) => {
  const response = await api.post(`/chats/${otherUserId}/messages`, { content });
  return response.data;
};
