// src/services/partnerSubCategory.service.ts
import { http } from './http.service';
import type { PartnerSubCategory, PartnerSubCategoryDto } from '../types/partner';
import type { PaginationRequest, PaginatedResponse } from '../types/category';

export const partnerSubCategoryService = {
  getAll: (includeInActive = false) => 
    http.get<PartnerSubCategory[]>(`/PartnerSubCategories/getAllPartnerSubCategoriess?includeInActive=${includeInActive}`),
  
  getById: (id: number) => 
    http.get<PartnerSubCategory>(`/PartnerSubCategories/getPartnerSubCategoriesById/${id}`),
  
  getByPartnerId: (partnerId: number) => 
    http.get<PartnerSubCategory[]>(`/PartnerSubCategories/getByPartnerId/${partnerId}`),
  
  getPaginated: (params: PaginationRequest) => 
    http.post<PaginatedResponse<PartnerSubCategory>>('/PartnerSubCategories/getPaginatedPartnerSubCategoriess', params),
  
  create: (data: PartnerSubCategoryDto) => 
    http.post<PartnerSubCategory>('/PartnerSubCategories/addPartnerSubCategories', data),
  
  update: (data: PartnerSubCategoryDto) => 
    http.put<PartnerSubCategory>('/PartnerSubCategories/updatePartnerSubCategories', data),
  
  delete: (id: number) => 
    http.delete<void>(`/PartnerSubCategories/DeletePartnerSubCategories/${id}`),
};
