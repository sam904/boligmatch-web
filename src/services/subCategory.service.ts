// src/services/subCategory.service.ts
import { http } from './http.service';
import type { SubCategory, SubCategoryDto } from '../types/subcategory';
import type { PaginationRequest } from '../types/category';

export const subCategoryService = {
  getAll: (includeInActive = false) => 
    http.get<SubCategory[]>(`/api/SubCategories/getAllSubCategoriess?includeInActive=${includeInActive}`),
  
  getById: (id: number) => 
    http.get<SubCategory>(`/api/SubCategories/getSubCategoriesById/${id}`),
  
  getByCategoryId: (categoryId: number, includeInActive = false) => 
    http.get<SubCategory[]>(`/api/SubCategories/getSubCategorysByCategoryId/${categoryId}?includeInActive=${includeInActive}`),
  
  getPaginated: async (params: PaginationRequest) => {
    const response = await http.post<{ output: { result: SubCategory[]; rowCount: number } }>('/api/SubCategories/getPaginatedSubCategoriess', params);
    return {
      data: response.output.result,
      total: response.output.rowCount,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  
  create: (data: SubCategoryDto) => 
    http.post<SubCategory>('/api/SubCategories/addSubCategories', data),
  
  update: (data: SubCategoryDto) => 
    http.put<SubCategory>('/api/SubCategories/updateSubCategories', data),
  
  delete: (id: number) => 
    http.del<void>(`/api/SubCategories/DeleteSubCategories/${id}`),
};
