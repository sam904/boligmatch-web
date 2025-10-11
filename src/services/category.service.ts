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
  getAll: async (includeInActive = false) => {
    const response = await http.get<{ output: { result: Category[] } }>(`/api/Category/getAllCategorys`, { includeInActive });
    return response.output?.result || [];
  },
  add: (body: Omit<Category, 'id'>) => http.post<Category>(`/api/Category/addCategory`, body),
  update: (body: Category) => http.put<Category>(`/api/Category/updateCategory`, body),
  remove: (id: number) => http.del<void>(`/api/Category/DeleteCategory/${id}`),
  getPaginated: async (query: PaginatedQuery) => {
    const response = await http.post<{ output: { result: Category[]; rowCount: number } }>(`/api/Category/getPaginatedCategorys`, query);
    return {
      items: response.output.result,
      total: response.output.rowCount,
    };
  },
};
