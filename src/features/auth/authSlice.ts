// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { tokenStorage } from '../../lib/storage';

type AuthState = {
  user: { id: string; email: string; roles: string[] } | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'error';
};
const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccess(),
  refreshToken: tokenStorage.getRefresh(),
  status: 'idle',
};

export const loginThunk = createAsyncThunk('auth/login', async (dto: { email: string; password: string }) => {
  const res = await authService.login(dto);
  return res;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      tokenStorage.clearAll();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => { state.status = 'loading'; })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        tokenStorage.setAccess(payload.accessToken);
        tokenStorage.setRefresh(payload.refreshToken);
      })
      .addCase(loginThunk.rejected, state => { state.status = 'error'; });
  }
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
