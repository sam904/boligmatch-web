// src/features/users/users.service.ts
import { http } from '../../services/http.service';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;

export type UsersQuery = { page?: number; pageSize?: number; search?: string; role?: string };
export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export const usersService = {
  list: (q: UsersQuery) => http.get<Paged<User>>('/users', q),
  create: (body: Partial<User>) => http.post<User>('/users', body),
  update: (id: string, body: Partial<User>) => http.put<User>(`/users/${id}`, body),
  remove: (id: string) => http.delete<void>(`/users/${id}`),
};
