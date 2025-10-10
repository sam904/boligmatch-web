// src/services/user.service.ts
import { http } from './http.service';

export type User = {
  id: number;
  email: string;
  roles: string[];
  isActive: boolean;
};

export const userService = {
  getById: (id: number) => http.get<User>(`/api/User/getUserById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<User[]>(`/api/User/getAllUsers`, { includeInActive }),
  add: (body: Omit<User, 'id'>) => http.post<User>(`/api/User/addUser`, body),
  update: (body: User) => http.put<User>(`/api/User/updateUser`, body),
  remove: (id: number) => http.del<void>(`/api/User/DeleteUser/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: User[]; total: number }>(`/api/User/getPaginatedUsers`, query),
};
