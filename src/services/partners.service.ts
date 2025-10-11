// src/services/partners.service.ts
import { http } from './http.service';
export type Partner = { id: number; userId: number; address: string; businessUnit: number; videoUrl?: string; logoUrl?: string; cvr?: number; descriptionShort?: string; isActive: boolean };

export const partnersService = {
  getById: (id: number) => http.get<Partner>(`/api/Partners/getPartnersById/${id}`),
  getAll: (includeInActive = true) => http.get<Partner[]>(`/api/Partners/getAllPartnerss`, { includeInActive }),
  add: (body: Omit<Partner, 'id'>) => http.post<Partner>(`/api/Partners/addPartners`, body),
  update: (body: Partner) => http.put<Partner>(`/api/Partners/updatePartners`, body),
  remove: (id: number) => http.delete<void>(`/api/Partners/DeletePartners/${id}`),
  getPaginated: (query: any) => http.post<{ items: Partner[]; total: number }>(`/api/Partners/getPaginatedPartnerss`, query),
};
