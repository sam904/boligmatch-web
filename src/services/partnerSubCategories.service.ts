// src/services/partnerSubCategories.service.ts
import { http } from './http.service';
export type PartnerSubCategory = { id: number; patnerId: number; subCategoryId: number; isActive: boolean };

export const partnerSubCategoriesService = {
  getById: (id: number) => http.get<PartnerSubCategory>(`/api/PartnerSubCategories/getPartnerSubCategoriesById/${id}`),
  getAll: (includeInActive = true) => http.get<PartnerSubCategory[]>(`/api/PartnerSubCategories/getAllPartnerSubCategoriess`, { includeInActive }),
  add: (body: Omit<PartnerSubCategory, 'id'>) => http.post<PartnerSubCategory>(`/api/PartnerSubCategories/addPartnerSubCategories`, body),
  update: (body: PartnerSubCategory) => http.put<PartnerSubCategory>(`/api/PartnerSubCategories/updatePartnerSubCategories`, body),
  remove: (id: number) => http.del<void>(`/api/PartnerSubCategories/DeletePartnerSubCategories/${id}`),
  getPaginated: (query: any) => http.post<{ items: PartnerSubCategory[]; total: number }>(`/api/PartnerSubCategories/getPaginatedPartnerSubCategoriess`, query),
};
