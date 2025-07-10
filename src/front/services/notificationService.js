import api from './authService';

export const getNotifications = async () => {
  const response = await api.get(`/notifications`);
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`, {});
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};
