// src/services/category.service.ts
import { http } from './http.service';

export type Category = {
  id: number;
  name: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive: boolean;
};

export type PaginatedQuery = {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortDirection?: 'asc' | 'desc';
  sortField?: string;
  userId?: number;
  isFeatured?: number;
  isPrivateCourse?: boolean;
  isPublish?: boolean;
  statusId?: number;
};

export const categoryService = {
  getById: (id: number) => http.get<Category>(`/api/Category/getCategoryById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<Category[]>(`/api/Category/getAllCategorys`, { includeInActive }),
  add: (body: Omit<Category, 'id'>) => http.post<Category>(`/api/Category/addCategory`, body),
  update: (body: Category) => http.put<Category>(`/api/Category/updateCategory`, body),
  remove: (id: number) => http.del<void>(`/api/Category/DeleteCategory/${id}`),
  getPaginated: (query: PaginatedQuery) =>
    http.post<{ items: Category[]; total: number }>(`/api/Category/getPaginatedCategorys`, query),
};
