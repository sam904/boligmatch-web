// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { tokenStorage } from '../../lib/storage';
import type { AuthUser, LoginDto } from '../../types/auth';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
};

const initialState: AuthState = {
  user: tokenStorage.getUser(),
  accessToken: tokenStorage.getAccess(),
  refreshToken: tokenStorage.getRefresh(),
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (dto: LoginDto, { rejectWithValue }) => {
  try {
    const res = await authService.login(dto);
    if (!res.isSuccess) {
      return rejectWithValue(res.failureReason || 'Login failed');
    }
    return res;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    setUser: (state, { payload }) => {
      state.user = payload;
      tokenStorage.setUser(payload);
    },
    updateUser: (state, { payload }) => {
      if (state.user) {
        state.user = { 
          ...state.user, 
          ...payload 
        };
        tokenStorage.setUser(state.user);
      }
    },
    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      tokenStorage.clearAll();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => { 
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.error = null;
        const { output } = payload;
        const user = {
          userId: output.userId,
          firstName: output.firstName,
          lastName: output.lastName,
          email: output.email,
          avatar: output.avatar,
          role: output.role,
          roleIds: output.roleIds,
          roleName: output.roleName,
          franchiseId: output.franchiseId,
          admissionId: output.admissionId,
          mobileNo: output.mobileNo,
        };
        state.user = user;
        state.accessToken = output.token;
        state.refreshToken = output.refreshToken;
        tokenStorage.setAccess(output.token);
        tokenStorage.setRefresh(output.refreshToken);
        tokenStorage.setUser(user);
      })
      .addCase(loginThunk.rejected, (state, action) => { 
        state.status = 'error';
        state.error = action.payload as string || 'Login failed';
      });
  }
});

export const { logout, setTokens, setUser, updateUser } = authSlice.actions;
export default authSlice.reducer;