// src/services/recommendation.service.ts
import { http } from './http.service';
export type Recommendation = { id: number; patnerId: number; email: string; description: string; isActive: boolean };

export const recommendationService = {
  getById: (id: number) => http.get<Recommendation>(`/Recommendation/getRecommendationById/${id}`),
  getAll: (includeInActive = true) => http.get<Recommendation[]>(`/Recommendation/getAllRecommendations`, { includeInActive }),
  add: (body: Omit<Recommendation, 'id'>) => http.post<Recommendation>(`/Recommendation/addRecommendation`, body),
  update: (body: Recommendation) => http.put<Recommendation>(`/Recommendation/updateRecommendation`, body),
  remove: (id: number) => http.delete<void>(`/Recommendation/DeleteRecommendation/${id}`),
  getPaginated: (query: any) => http.post<{ items: Recommendation[]; total: number }>(`/Recommendation/getPaginatedRecommendations`, query),
};
