// src/services/subCategories.service.ts
import { http } from './http.service';
export type SubCategory = { id: number; name: string; categoryId: number; imageUrl?: string; iconUrl?: string; isActive: boolean };

export const subCategoriesService = {
  getById: (id: number) => http.get<SubCategory>(`/api/SubCategories/getSubCategoriesById/${id}`),
  getAll: (includeInActive = true) => http.get<SubCategory[]>(`/api/SubCategories/getAllSubCategoriess`, { includeInActive }),
  add: (body: Omit<SubCategory, 'id'>) => http.post<SubCategory>(`/api/SubCategories/addSubCategories`, body),
  update: (body: SubCategory) => http.put<SubCategory>(`/api/SubCategories/updateSubCategories`, body),
  remove: (id: number) => http.delete<void>(`/api/SubCategories/DeleteSubCategories/${id}`),
  getPaginated: (query: any) => http.post<{ items: SubCategory[]; total: number }>(`/api/SubCategories/getPaginatedSubCategoriess`, query),
};
