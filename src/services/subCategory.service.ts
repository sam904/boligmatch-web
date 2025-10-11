// src/services/subCategory.service.ts
import { http } from './http.service';
import type { SubCategory, SubCategoryDto } from '../types/subcategory';
import type { PaginationRequest, PaginatedResponse } from '../types/category';

export const subCategoryService = {
  getAll: (includeInActive = false) => 
    http.get<SubCategory[]>(`/api/SubCategories/getAllSubCategoriess?includeInActive=${includeInActive}`),
  
  getById: (id: number) => 
    http.get<SubCategory>(`/api/SubCategories/getSubCategoriesById/${id}`),
  
  getByCategoryId: (categoryId: number, includeInActive = false) => 
    http.get<SubCategory[]>(`/api/SubCategories/getSubCategorysByCategoryId/${categoryId}?includeInActive=${includeInActive}`),
  
  getPaginated: (params: PaginationRequest) => 
    http.post<PaginatedResponse<SubCategory>>('/api/SubCategories/getPaginatedSubCategoriess', params),
  
  create: (data: SubCategoryDto) => 
    http.post<SubCategory>('/api/SubCategories/addSubCategories', data),
  
  update: (data: SubCategoryDto) => 
    http.put<SubCategory>('/api/SubCategories/updateSubCategories', data),
  
  delete: (id: number) => 
    http.delete<void>(`/api/SubCategories/DeleteSubCategories/${id}`),
};
