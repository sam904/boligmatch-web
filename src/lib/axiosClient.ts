// src/lib/axiosClient.ts
import axios from 'axios';
import { env } from './env';
import { tokenStorage } from './storage';
import { store } from '../app/store';
import { logout, setTokens } from '../features/auth/authSlice';

export const axiosClient = axios.create({
  baseURL: env.apiUrl,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
};

axiosClient.interceptors.request.use(config => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>(resolve =>
          pendingQueue.push(() => resolve())
        );
        const token = tokenStorage.getAccess();
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosClient(original);
        }
        return Promise.reject(error);
      }

      isRefreshing = true;
      try {
        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${env.apiUrl}/auth/refresh`, {
          refreshToken,
        });

        tokenStorage.setAccess(data.accessToken);
        tokenStorage.setRefresh(data.refreshToken);
        store.dispatch(setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }));

        processQueue(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(original);
      } catch (e) {
        tokenStorage.clearAll();
        store.dispatch(logout());
        processQueue(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
