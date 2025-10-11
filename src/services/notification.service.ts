// src/services/notification.service.ts
import { http } from './http.service';
export type Notification = { id: number; title: string; description: string; isActive: boolean };

export const notificationService = {
  getById: (id: number) => http.get<Notification>(`/api/Notification/getNotificationById/${id}`),
  getAll: (includeInActive = true) => http.get<Notification[]>(`/api/Notification/getAllNotifications`, { includeInActive }),
  add: (body: Omit<Notification, 'id'>) => http.post<Notification>(`/api/Notification/addNotification`, body),
  update: (body: Notification) => http.put<Notification>(`/api/Notification/updateNotification`, body),
  remove: (id: number) => http.delete<void>(`/api/Notification/DeleteNotification/${id}`),
  getPaginated: (query: any) => http.post<{ items: Notification[]; total: number }>(`/api/Notification/getPaginatedNotifications`, query),
};
