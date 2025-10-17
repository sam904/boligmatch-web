// src/services/files.service.ts
import { http } from './http.service';
export type FileItem = { id: number; partnerId: number; type: string; title: string; size: number; url: string; isActive: boolean };

export const filesService = {
  getById: (id: number) => http.get<FileItem>(`/Files/getFilesById/${id}`),
  getAll: (includeInActive = true) => http.get<FileItem[]>(`/Files/getAllFiless`, { includeInActive }),
  add: (body: Omit<FileItem, 'id'>) => http.post<FileItem>(`/Files/addFiles`, body),
  update: (body: FileItem) => http.put<FileItem>(`/Files/updateFiles`, body),
  remove: (id: number) => http.delete<void>(`/Files/DeleteFiles/${id}`),
  getPaginated: (query: any) => http.post<{ items: FileItem[]; total: number }>(`/Files/getPaginatedFiless`, query),
};
