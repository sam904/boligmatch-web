// src/services/auth.service.ts
import { http } from './http.service';
import type { LoginDto, LoginResponse, AuthUser } from '../types/auth';

export const authService = {
  login: (dto: LoginDto) => http.post<LoginResponse>('/User/authenticate', dto),
  me: () => http.get<AuthUser>('/auth/me'),
  logout: () => http.post<void>('/auth/logout'),
};
