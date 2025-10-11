// src/services/files.service.ts
import { http } from './http.service';
export type FileItem = { id: number; partnerId: number; type: string; title: string; size: number; url: string; isActive: boolean };

export const filesService = {
  getById: (id: number) => http.get<FileItem>(`/api/Files/getFilesById/${id}`),
  getAll: (includeInActive = true) => http.get<FileItem[]>(`/api/Files/getAllFiless`, { includeInActive }),
  add: (body: Omit<FileItem, 'id'>) => http.post<FileItem>(`/api/Files/addFiles`, body),
  update: (body: FileItem) => http.put<FileItem>(`/api/Files/updateFiles`, body),
  remove: (id: number) => http.delete<void>(`/api/Files/DeleteFiles/${id}`),
  getPaginated: (query: any) => http.post<{ items: FileItem[]; total: number }>(`/api/Files/getPaginatedFiless`, query),
};
