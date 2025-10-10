// src/services/userRoleMapping.service.ts
import { http } from './http.service';
export type UserRoleMapping = { id: number; userId: number; roleId: number; isActive: boolean };

export const userRoleMappingService = {
  getById: (id: number) => http.get<UserRoleMapping>(`/api/UserRoleMapping/getUserRoleMappingById/${id}`),
  getAll: (includeInActive = true) => http.get<UserRoleMapping[]>(`/api/UserRoleMapping/getAllUserRoleMappings`, { includeInActive }),
  add: (body: Omit<UserRoleMapping, 'id'>) => http.post<UserRoleMapping>(`/api/UserRoleMapping/addUserRoleMapping`, body),
  update: (body: UserRoleMapping) => http.put<UserRoleMapping>(`/api/UserRoleMapping/updateUserRoleMapping`, body),
  remove: (id: number) => http.del<void>(`/api/UserRoleMapping/DeleteUserRoleMapping/${id}`),
  getPaginated: (query: any) => http.post<{ items: UserRoleMapping[]; total: number }>(`/api/UserRoleMapping/getPaginatedUserRoleMappings`, query),
};
