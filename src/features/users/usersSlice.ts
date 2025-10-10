// src/features/users/usersSlice.ts
import { createSlice } from '@reduxjs/toolkit';

type UsersUIState = { page: number; pageSize: number; search: string; role: string  };
const initialState: UsersUIState = { page: 1, pageSize: 10, search: '', role: '' };

const slice = createSlice({
  name: 'usersUI',
  initialState,
  reducers: {
    setPage: (s, a) => { s.page = a.payload; },
    setPageSize: (s, a) => { s.pageSize = a.payload; },
    setSearch: (s, a) => { s.search = a.payload; },
    setRole: (s, a) => { s.role = a.payload; },
    reset: () => initialState,
  }
});

export const { setPage, setPageSize, setSearch, setRole, reset } = slice.actions;
export default slice.reducer;
