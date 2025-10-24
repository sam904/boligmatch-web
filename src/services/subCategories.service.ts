// src/services/subCategories.service.ts
import { http } from './http.service';
export type SubCategory = { id: number; name: string; categoryId: number; imageUrl?: string; iconUrl?: string; isActive: boolean };

export const subCategoriesService = {
  getById: (id: number) => http.get<SubCategory>(`/SubCategories/getSubCategoriesById/${id}`),
  getAll: (includeInActive = true) => http.get<SubCategory[]>(`/SubCategories/getAllSubCategoriess`, { includeInActive }),
  getByCategoryId: (categoryId: number) => http.get<any[]>(`/Category/getSubCategoriesByCategoryId/${categoryId}`),
  add: (body: Omit<SubCategory, 'id'>) => http.post<SubCategory>(`/SubCategories/addSubCategories`, body),
  update: (body: SubCategory) => http.put<SubCategory>(`/SubCategories/updateSubCategories`, body),
  remove: (id: number) => http.delete<void>(`/SubCategories/DeleteSubCategories/${id}`),
  getPaginated: (query: any) => http.post<{ items: SubCategory[]; total: number }>(`/SubCategories/getPaginatedSubCategoriess`, query),
};
