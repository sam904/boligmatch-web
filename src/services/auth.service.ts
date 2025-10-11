// src/services/auth.service.ts
import { http } from './http.service';
import type { LoginDto, LoginResponse, AuthUser } from '../types/auth';

export const authService = {
  login: (dto: LoginDto) => http.post<LoginResponse>('/api/User/authenticate', dto),
  me: () => http.get<AuthUser>('/api/auth/me'),
  logout: () => http.post<void>('/api/auth/logout'),
};
