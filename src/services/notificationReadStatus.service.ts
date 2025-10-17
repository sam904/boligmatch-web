// src/services/notificationReadStatus.service.ts
import { http } from './http.service';
export type NotificationReadStatus = { id: number; userId: number; isRead: boolean; isActive: boolean };

export const notificationReadStatusService = {
  getById: (id: number) => http.get<NotificationReadStatus>(`/NotificationReadStatus/getNotificationReadStatusById/${id}`),
  getAll: (includeInActive = true) => http.get<NotificationReadStatus[]>(`/NotificationReadStatus/getAllNotificationReadStatuss`, { includeInActive }),
  add: (body: Omit<NotificationReadStatus, 'id'>) => http.post<NotificationReadStatus>(`/NotificationReadStatus/addNotificationReadStatus`, body),
  update: (body: NotificationReadStatus) => http.put<NotificationReadStatus>(`/NotificationReadStatus/updateNotificationReadStatus`, body),
  remove: (id: number) => http.delete<void>(`/NotificationReadStatus/DeleteNotificationReadStatus/${id}`),
  getPaginated: (query: any) => http.post<{ items: NotificationReadStatus[]; total: number }>(`/NotificationReadStatus/getPaginatedNotificationReadStatuss`, query),
};
