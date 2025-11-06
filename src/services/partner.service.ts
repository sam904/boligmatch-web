// src/services/partner.service.ts
import { http } from './http.service';
import type { Partner, PartnerDto, PaginatedPartnersResponse } from '../types/partner';

export const partnerService = {
  getAll: async (includeInActive = false) => {
    const response = await http.get<{ output: { result: Partner[] } }>(`/Partner/getAllPartners?includeInActive=${includeInActive}`);
    return response.output?.result || [];
  },
  
  getById: (id: number) => 
    http.get<Partner>(`/Partner/getPartnerById/${id}`),
  
  getPaginated: (query: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }) => http.post<PaginatedPartnersResponse>('/Partner/getPaginatedPartners', query),
  
  create: (data: PartnerDto) => 
    http.post<Partner>('/Partner/addPartner', data),
  
  update: (data: PartnerDto) => 
    http.put<Partner>('/Partner/updatePartner', data),
  
  refetchPartner: (id: number) => 
    http.get<Partner>(`/Partner/getPartnerById/${id}`),
  
  delete: (id: number) => 
    http.delete<void>(`/Partner/DeletePartner/${id}`),

  addPartnerPageVisit: (data: { 
    id: number; 
    userId: number; 
    partnerId: number; 
    isActive: boolean; 
  }) => http.post('/PartnerPageVisit/addPartnerPageVisit', data),

  getPartnerPageCount : (partnerId: number) => 
    http.get<number>(`/Partner/getPartnersByPartnerIdCountList/${partnerId}`),

};