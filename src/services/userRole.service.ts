// src/services/userRole.service.ts
import { http } from './http.service';
export type UserRole = { id: number; roleName: string; description?: string; isActive: boolean };

export const userRoleService = {
  getById: (id: number) => http.get<UserRole>(`/UserRole/getUserRoleById/${id}`),
  getAll: (includeInActive = true) => http.get<UserRole[]>(`/UserRole/getAllUserRoles`, { includeInActive }),
  add: (body: Omit<UserRole, 'id'>) => http.post<UserRole>(`/UserRole/addUserRole`, body),
  update: (body: UserRole) => http.put<UserRole>(`/UserRole/updateUserRole`, body),
  remove: (id: number) => http.delete<void>(`/UserRole/DeleteUserRole/${id}`),
  getPaginated: (query: any) => http.post<{ items: UserRole[]; total: number }>(`/UserRole/getPaginatedUserRoles`, query),
};
