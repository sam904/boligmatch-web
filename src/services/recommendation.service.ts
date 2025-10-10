// src/services/recommendation.service.ts
import { http } from './http.service';
export type Recommendation = { id: number; patnerId: number; email: string; description: string; isActive: boolean };

export const recommendationService = {
  getById: (id: number) => http.get<Recommendation>(`/api/Recommendation/getRecommendationById/${id}`),
  getAll: (includeInActive = true) => http.get<Recommendation[]>(`/api/Recommendation/getAllRecommendations`, { includeInActive }),
  add: (body: Omit<Recommendation, 'id'>) => http.post<Recommendation>(`/api/Recommendation/addRecommendation`, body),
  update: (body: Recommendation) => http.put<Recommendation>(`/api/Recommendation/updateRecommendation`, body),
  remove: (id: number) => http.del<void>(`/api/Recommendation/DeleteRecommendation/${id}`),
  getPaginated: (query: any) => http.post<{ items: Recommendation[]; total: number }>(`/api/Recommendation/getPaginatedRecommendations`, query),
};
