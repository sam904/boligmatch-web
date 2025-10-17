// src/services/favourites.service.ts
import { http } from './http.service';

export type Favourite = {
  id: number;
  userId: number;
  partnerId: number;
  isActive: boolean;
};

export const favouritesService = {
  getById: (id: number) => http.get<Favourite>(`/Favourites/getFavouritesById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<Favourite[]>(`/Favourites/getAllFavouritess`, { includeInActive }),
  add: (body: Omit<Favourite, 'id'>) => http.post<Favourite>(`/Favourites/addFavourites`, body),
  update: (body: Favourite) => http.put<Favourite>(`/Favourites/updateFavourites`, body),
  remove: (id: number) => http.delete<void>(`/Favourites/DeleteFavourites/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Favourite[]; total: number }>(
      `/Favourites/getPaginatedFavouritess`,
      query
    ),
};
