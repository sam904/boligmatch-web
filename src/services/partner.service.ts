// src/services/partner.service.ts
import { http } from './http.service';
import type { Partner, PartnerDto } from '../types/partner';
import type { PaginationRequest, PaginatedResponse } from '../types/category';

export const partnerService = {
  getAll: (includeInActive = false) => 
    http.get<Partner[]>(`/Partners/getAllPartners?includeInActive=${includeInActive}`),
  
  getById: (id: number) => 
    http.get<Partner>(`/Partners/getPartnersById/${id}`),
  
  getPaginated: (params: PaginationRequest) => 
    http.post<PaginatedResponse<Partner>>('/Partners/getPaginatedPartners', params),
  
  create: (data: PartnerDto) => 
    http.post<Partner>('/Partners/addPartners', data),
  
  update: (data: PartnerDto) => 
    http.put<Partner>('/Partners/updatePartners', data),
  
  delete: (id: number) => 
    http.delete<void>(`/Partners/DeletePartners/${id}`),
};
