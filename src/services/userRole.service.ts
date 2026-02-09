// src/services/userRole.service.ts
import { http } from './http.service';

export type UserRole = { 
  id: number; 
  roleName: string; 
  description?: string; 
  isActive: boolean;
  status?: "Active" | "InActive";
};

// Update the return type based on your API response
export interface UserRolesApiResponse {
  output?: {
    result?: UserRole[];
    success?: boolean;
    message?: string;
    rowCount?: number;
  };
  result?: UserRole[];
  success?: boolean;
  message?: string;
  items?: UserRole[];
}

export const userRoleService = {
  getById: (id: number) => http.get<UserRole>(`/UserRole/getUserRoleById/${id}`),
  getAll: (includeInActive = true) => 
    http.get<UserRolesApiResponse>(`/UserRole/getAllUserRoles`, { includeInActive }),
  add: (body: Omit<UserRole, 'id'>) => http.post<UserRole>(`/UserRole/addUserRole`, body),
  update: (body: UserRole) => http.put<UserRole>(`/UserRole/updateUserRole`, body),
  remove: (id: number) => http.delete<void>(`/UserRole/DeleteUserRole/${id}`),
  getPaginated: (query: any) => 
    http.post<{ output: { result: UserRole[]; rowCount: number } }>(
      `/UserRole/getPaginatedUserRoles`, 
      query
    ),
};

