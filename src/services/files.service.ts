// src/services/files.service.ts
import { http } from './http.service';
import type { File, FileDto, PaginationRequest, PaginatedResponse } from '../types/file';

export const filesService = {
  getById: (id: number) => http.get<File>(`/Files/getFilesById/${id}`),
  getAll: (includeInActive = true) => http.get<File[]>(`/Files/getAllFiless`, { includeInActive }),
  add: (body: FileDto) => http.post<File>(`/Files/addFiles`, body),
  update: (body: File) => http.put<File>(`/Files/updateFiles`, body),
  remove: (id: number) => http.delete<void>(`/Files/DeleteFiles/${id}`),
  getPaginated: (query: PaginationRequest) => http.post<PaginatedResponse<File>>(`/Files/getPaginatedFiless`, query),
};