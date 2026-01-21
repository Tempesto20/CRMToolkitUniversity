import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLeaveTypes = createAsyncThunk(
  'leaveTypes/fetchLeaveTypesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leave-types');
    return data;
  }
);

export const fetchLeaveTypesStats = createAsyncThunk(
  'leaveTypes/fetchLeaveTypesStatsStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leave-types/stats');
    return data;
  }
);

export const searchLeaveTypes = createAsyncThunk(
  'leaveTypes/searchLeaveTypesStatus',
  async (query: string) => {
    const { data } = await axios.get(`http://localhost:3000/leave-types/search?q=${query}`);
    return data;
  }
);

export const createLeaveType = createAsyncThunk(
  'leaveTypes/createLeaveTypeStatus',
  async (leaveTypeData: { leaveTypeId: number; leaveTypeName: string; description?: string }) => {
    const { data } = await axios.post('http://localhost:3000/leave-types', leaveTypeData);
    return data;
  }
);

export const updateLeaveType = createAsyncThunk(
  'leaveTypes/updateLeaveTypeStatus',
  async ({ id, ...updateData }: { id: number; leaveTypeName?: string; description?: string }) => {
    const { data } = await axios.put(`http://localhost:3000/leave-types/${id}`, updateData);
    return data;
  }
);

export const deleteLeaveType = createAsyncThunk(
  'leaveTypes/deleteLeaveTypeStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/leave-types/${id}`);
    return id;
  }
);

interface LeaveTypeState {
  leaveTypes: any[];
  leaveTypesStats: any[];
  searchResults: any[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: LeaveTypeState = {
  leaveTypes: [],
  leaveTypesStats: [],
  searchResults: [],
  status: 'idle',
  error: null,
};

const leaveTypesSlice = createSlice({
  name: 'leaveTypes',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Получение всех типов отпусков
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch leave types';
      })
      // Получение статистики
      .addCase(fetchLeaveTypesStats.fulfilled, (state, action) => {
        state.leaveTypesStats = action.payload;
      })
      // Поиск типов отпусков
      .addCase(searchLeaveTypes.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Создание типа отпуска
      .addCase(createLeaveType.fulfilled, (state, action) => {
        state.leaveTypes.push(action.payload);
      })
      // Обновление типа отпуска
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        const index = state.leaveTypes.findIndex(
          lt => lt.leaveTypeId === action.payload.leaveTypeId
        );
        if (index !== -1) {
          state.leaveTypes[index] = action.payload;
        }
      })
      // Удаление типа отпуска
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.leaveTypes = state.leaveTypes.filter(
          lt => lt.leaveTypeId !== action.payload
        );
      });
  },
});

export const { clearSearchResults } = leaveTypesSlice.actions;
export default leaveTypesSlice.reducer;