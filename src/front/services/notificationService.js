import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`, getAuthHeader());
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, getAuthHeader());
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, getAuthHeader());
  return response.data;
};
