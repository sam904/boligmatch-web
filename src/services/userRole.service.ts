// src/services/userRole.service.ts
import { http } from './http.service';
export type UserRole = { id: number; roleName: string; description?: string; isActive: boolean };

export const userRoleService = {
  getById: (id: number) => http.get<UserRole>(`/api/UserRole/getUserRoleById/${id}`),
  getAll: (includeInActive = true) => http.get<UserRole[]>(`/api/UserRole/getAllUserRoles`, { includeInActive }),
  add: (body: Omit<UserRole, 'id'>) => http.post<UserRole>(`/api/UserRole/addUserRole`, body),
  update: (body: UserRole) => http.put<UserRole>(`/api/UserRole/updateUserRole`, body),
  remove: (id: number) => http.del<void>(`/api/UserRole/DeleteUserRole/${id}`),
  getPaginated: (query: any) => http.post<{ items: UserRole[]; total: number }>(`/api/UserRole/getPaginatedUserRoles`, query),
};
