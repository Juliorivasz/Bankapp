import apiClient from './apiClient';
import type { Notification } from '../types/client/notification.types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/cliente/notificaciones');
    return response.data;
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/cliente/notificaciones/no-leidas');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/cliente/notificaciones/contador');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiClient.put<Notification>(`/cliente/notificaciones/${id}/leer`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/cliente/notificaciones/leer-todas');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/cliente/notificaciones/${id}`);
  }
};
