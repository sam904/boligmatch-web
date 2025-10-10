// src/services/auth.service.ts
import { http } from './http.service';

export type LoginDto = { email: string; password: string };
export type AuthUser = { id: string; email: string; roles: string[] };

export const authService = {
  login: (dto: LoginDto) => http.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', dto),
  me: () => http.get<AuthUser>('/auth/me'),
  logout: () => http.post<void>('/auth/logout'),
};
