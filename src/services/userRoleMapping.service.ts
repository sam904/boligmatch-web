// src/services/userRoleMapping.service.ts
import { http } from './http.service';
export type UserRoleMapping = { id: number; userId: number; roleId: number; isActive: boolean };

export const userRoleMappingService = {
  getById: (id: number) => http.get<UserRoleMapping>(`/UserRoleMapping/getUserRoleMappingById/${id}`),
  getAll: (includeInActive = true) => http.get<UserRoleMapping[]>(`/UserRoleMapping/getAllUserRoleMappings`, { includeInActive }),
  add: (body: Omit<UserRoleMapping, 'id'>) => http.post<UserRoleMapping>(`/UserRoleMapping/addUserRoleMapping`, body),
  update: (body: UserRoleMapping) => http.put<UserRoleMapping>(`/UserRoleMapping/updateUserRoleMapping`, body),
  remove: (id: number) => http.delete<void>(`/UserRoleMapping/DeleteUserRoleMapping/${id}`),
  getPaginated: (query: any) => http.post<{ items: UserRoleMapping[]; total: number }>(`/UserRoleMapping/getPaginatedUserRoleMappings`, query),
};
