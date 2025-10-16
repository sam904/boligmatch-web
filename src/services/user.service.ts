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
  
  // Use proper types for adding users
  add: (body: CreateUserRequest) => http.post<User>(`/User/addUser`, body),
  
  // Use proper types for updating users
  update: (body: UpdateUserRequest) => http.put<User>(`/User/updateUser`, body),
  
  remove: (id: number) => http.delete<void>(`/User/DeleteUser/${id}`),
  
  getPaginated: (query: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }) => http.post<PaginatedUsersResponse>(`/User/getPaginatedUsers`, query),
};






// // src/services/user.service.ts
// import { http } from './http.service';
// import type { User } from '../types/user';

// export const userService = {
//   getById: (id: number) => http.get<User>(`/User/getUserById/${id}`),
//   getAll: (includeInActive = false) =>
//     http.get<User[]>(`/User/getAllUsers?includeInActive=${includeInActive}`),
//   add: (body: Omit<User, 'userId'>) => http.post<User>(`/User/addUser`, body),
//   update: (body: User) => http.put<User>(`/User/updateUser`, body),
//   remove: (id: number) => http.delete<void>(`/User/DeleteUser/${id}`),
//   getPaginated: (query: any) =>
//     http.post<{ items: User[]; total: number }>(`/User/getPaginatedUsers`, query),
// };
