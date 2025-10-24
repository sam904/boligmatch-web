// src/services/user.service.ts
import { http } from './http.service';
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedUsersResponse
} from '../types/user';

export const userService = {
  getById: (id: number) => http.get<User>(`/User/getUserById/${id}`),
  
  getAll: (includeInActive = false) =>
    http.get<User[]>(`/User/getAllUsers?includeInActive=${includeInActive}`),
  
  add: (body: CreateUserRequest) => http.post<User>(`/User/addUser`, body),
  
  update: (body: UpdateUserRequest) => http.put<User>(`/User/updateUser`, body),
  
  remove: (id: number) => http.delete<void>(`/User/DeleteUser/${id}`),
  
  getPaginated: (query: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }) => http.post<PaginatedUsersResponse>(`/User/getPaginatedUsers`, query),

  resetUserPassword: (data: { 
    email: string; 
    newPassword: string;
  }) => http.post<boolean>(`/Password/resetPassword`, {
    email: data.email,
    newPassword: data.newPassword,
    hash: "",
    salt: "",
    otp: 0,
  }),
};