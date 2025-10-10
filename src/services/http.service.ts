// src/services/http.service.ts
import { axiosClient } from '../lib/axiosClient';

export const http = {
  get: <T>(url: string, params?: any) => axiosClient.get<T>(url, { params }).then(r => r.data),
  post: <T>(url: string, body?: any) => axiosClient.post<T>(url, body).then(r => r.data),
  put:  <T>(url: string, body?: any) => axiosClient.put<T>(url, body).then(r => r.data),
  patch:<T>(url: string, body?: any) => axiosClient.patch<T>(url, body).then(r => r.data),
  del:  <T>(url: string) => axiosClient.delete<T>(url).then(r => r.data),
};
