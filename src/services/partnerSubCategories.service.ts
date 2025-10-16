// src/services/partnerSubCategories.service.ts
import { http } from './http.service';
export type PartnerSubCategory = { id: number; patnerId: number; subCategoryId: number; isActive: boolean };

export const partnerSubCategoriesService = {
  getById: (id: number) => http.get<PartnerSubCategory>(`/PartnerSubCategories/getPartnerSubCategoriesById/${id}`),
  getAll: (includeInActive = true) => http.get<PartnerSubCategory[]>(`/PartnerSubCategories/getAllPartnerSubCategoriess`, { includeInActive }),
  add: (body: Omit<PartnerSubCategory, 'id'>) => http.post<PartnerSubCategory>(`/PartnerSubCategories/addPartnerSubCategories`, body),
  update: (body: PartnerSubCategory) => http.put<PartnerSubCategory>(`/PartnerSubCategories/updatePartnerSubCategories`, body),
  remove: (id: number) => http.delete<void>(`/PartnerSubCategories/DeletePartnerSubCategories/${id}`),
  getPaginated: (query: any) => http.post<{ items: PartnerSubCategory[]; total: number }>(`/PartnerSubCategories/getPaginatedPartnerSubCategoriess`, query),
};
