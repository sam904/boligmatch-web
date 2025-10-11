// src/services/subCategory.service.ts
import { http } from './http.service';
import type { SubCategory, SubCategoryDto } from '../types/subcategory';
import type { PaginationRequest, PaginatedResponse } from '../types/category';

export const subCategoryService = {
  getAll: (includeInActive = false) => 
    http.get<SubCategory[]>(`/SubCategory/getAllSubCategorys?includeInActive=${includeInActive}`),
  
  getById: (id: number) => 
    http.get<SubCategory>(`/SubCategory/getSubCategoryById/${id}`),
  
  getByCategoryId: (categoryId: number, includeInActive = false) => 
    http.get<SubCategory[]>(`/SubCategory/getSubCategorysByCategoryId/${categoryId}?includeInActive=${includeInActive}`),
  
  getPaginated: (params: PaginationRequest) => 
    http.post<PaginatedResponse<SubCategory>>('/SubCategory/getPaginatedSubCategorys', params),
  
  create: (data: SubCategoryDto) => 
    http.post<SubCategory>('/SubCategory/addSubCategory', data),
  
  update: (data: SubCategoryDto) => 
    http.put<SubCategory>('/SubCategory/updateSubCategory', data),
  
  delete: (id: number) => 
    http.delete<void>(`/SubCategory/DeleteSubCategory/${id}`),
};
