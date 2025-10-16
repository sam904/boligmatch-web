// src/services/partner.service.ts
import { http } from './http.service';
import type { Partner, PartnerDto } from '../types/partner';
import type { PaginationRequest, PaginatedResponse } from '../types/category';

export const partnerService = {
  getAll: async (includeInActive = false) => {
    const response = await http.get<{ output: { result: Partner[] } }>(`/Partners/getAllPartnerss?includeInActive=${includeInActive}`);
    return response.output?.result || [];
  },
  
  getById: (id: number) => 
    http.get<Partner>(`/Partners/getPartnersById/${id}`),
  
  getPaginated: (params: PaginationRequest) => 
    http.post<PaginatedResponse<Partner>>('/Partners/getPaginatedPartnerss', params),
  
  create: (data: PartnerDto) => 
    http.post<Partner>('/Partners/addPartners', data),
  
  update: (data: PartnerDto) => 
    http.put<Partner>('/Partners/updatePartners', data),
  
  delete: (id: number) => 
    http.delete<void>(`/Partners/DeletePartners/${id}`),
};
