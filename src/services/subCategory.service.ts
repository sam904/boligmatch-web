// src/services/subCategory.service.ts
import { http } from './http.service';
import type { SubCategory, SubCategoryDto } from '../types/subcategory';
import type { PaginationRequest } from '../types/category';

export const subCategoryService = {
 getAll: async (includeInActive = false) => {
    const response = await http.get<any>(`/SubCategories/getAllSubCategoriess?includeInActive=${includeInActive}`);
    // Your API returns array directly in output, not output.result
    return response.output || [];
  },
  
  getById: async (id: number) => {
    const response = await http.get<any>(`/SubCategories/getSubCategoriesById/${id}`);
    // Unwrap common API envelope shape if present
    return response?.output ?? response;
  },
  
  getByCategoryId: async (categoryId: number, includeInActive = false) => {
    const response = await http.get<{ output: { result: SubCategory[] } }>(`/SubCategories/getSubCategorysByCategoryId/${categoryId}?includeInActive=${includeInActive}`);
    return response.output?.result || [];
  },
  
  getPaginated: async (params: PaginationRequest) => {
    const response = await http.post<{ output: { result: SubCategory[]; rowCount: number } }>('/SubCategories/getPaginatedSubCategoriess', params);
    return {
      data: response.output.result,
      total: response.output.rowCount,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  
  create: (data: SubCategoryDto) => 
    http.post<SubCategory>('/SubCategories/addSubCategories', data),
  
  update: (data: SubCategoryDto) => 
    http.put<SubCategory>('/SubCategories/updateSubCategories', data),
  
  delete: (id: number) => 
    http.delete<void>(`/SubCategories/DeleteSubCategories/${id}`),
};
