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

const DUMMY_USERS = {
  admin: {
    userName: 'admin',
    password: 'admin123',
    user: {
      userId: 1,
      firstName: 'Admin',
      lastName: 'User',
      avatar: '',
      role: 1,
      roleIds: [1],
      roleName: 'Admin',
      franchiseId: 0,
      admissionId: 0,
      mobileNo: '',
    },
  },
  partner: {
    userName: 'partner',
    password: 'partner123',
    user: {
      userId: 2,
      firstName: 'Partner',
      lastName: 'User',
      avatar: '',
      role: 2,
      roleIds: [2],
      roleName: 'Partner',
      franchiseId: 1,
      admissionId: 0,
      mobileNo: '',
    },
  },
  user: {
    userName: 'user',
    password: 'user123',
    user: {
      userId: 3,
      firstName: 'Regular',
      lastName: 'User',
      avatar: '',
      role: 3,
      roleIds: [3],
      roleName: 'User',
      franchiseId: 0,
      admissionId: 0,
      mobileNo: '',
    },
  },
};

export const loginThunk = createAsyncThunk('auth/login', async (dto: LoginDto, { rejectWithValue }) => {
  try {
    const dummyUser = Object.values(DUMMY_USERS).find(
      u => u.userName === dto.userName && u.password === dto.password
    );

    if (dummyUser) {
      return {
        isSuccess: true,
        output: {
          ...dummyUser.user,
          token: 'dummy-access-token-' + Date.now(),
          refreshToken: 'dummy-refresh-token-' + Date.now(),
        },
      };
    }

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

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
