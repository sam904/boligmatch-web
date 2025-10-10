// src/services/favourites.service.ts
import { http } from './http.service';

export type Favourite = {
  id: number;
  userId: number;
  partnerId: number;
  isActive: boolean;
};

export const favouritesService = {
  getById: (id: number) => http.get<Favourite>(`/api/Favourites/getFavouritesById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<Favourite[]>(`/api/Favourites/getAllFavouritess`, { includeInActive }),
  add: (body: Omit<Favourite, 'id'>) => http.post<Favourite>(`/api/Favourites/addFavourites`, body),
  update: (body: Favourite) => http.put<Favourite>(`/api/Favourites/updateFavourites`, body),
  remove: (id: number) => http.del<void>(`/api/Favourites/DeleteFavourites/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Favourite[]; total: number }>(
      `/api/Favourites/getPaginatedFavouritess`,
      query
    ),
};
