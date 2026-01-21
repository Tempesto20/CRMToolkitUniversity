import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeavesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leaves');
    return data as any[];
  }
);

export const fetchActiveLeaves = createAsyncThunk(
  'leaves/fetchActiveLeavesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leaves/active');
    return data as any[];
  }
);

export const fetchTodayLeaves = createAsyncThunk(
  'leaves/fetchTodayLeavesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leaves/today');
    return data as any[];
  }
);

export const fetchEmployeeLeaves = createAsyncThunk(
  'leaves/fetchEmployeeLeavesStatus',
  async (personalNumber: number) => {
    const { data } = await axios.get(`http://localhost:3000/leaves/employee/${personalNumber}`);
    return data as any[];
  }
);

export const fetchLeavesByPeriod = createAsyncThunk(
  'leaves/fetchLeavesByPeriodStatus',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const { data } = await axios.get(`http://localhost:3000/leaves/period?start=${startDate}&end=${endDate}`);
    return data as any[];
  }
);

export const fetchLeavesStats = createAsyncThunk(
  'leaves/fetchLeavesStatsStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/leaves/stats');
    return data;
  }
);

export const createLeave = createAsyncThunk(
  'leaves/createLeaveStatus',
  async (leaveData: any) => {
    const { data } = await axios.post('http://localhost:3000/leaves', leaveData);
    return data;
  }
);

export const updateLeave = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
    const { data } = await axios.put(`http://localhost:3000/leaves/${id}`, updateData);
    return data;
  }
);

export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeaveStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/leaves/${id}`);
    return id;
  }
);

interface LeavesState {
  leaves: any[];
  activeLeaves: any[];
  todayLeaves: any[];
  employeeLeaves: any[];
  leavesByPeriod: any[];
  stats: any;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: LeavesState = {
  leaves: [],
  activeLeaves: [],
  todayLeaves: [],
  employeeLeaves: [],
  leavesByPeriod: [],
  stats: null,
  status: 'idle',
  error: null,
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearEmployeeLeaves: (state) => {
      state.employeeLeaves = [];
    },
    clearLeavesByPeriod: (state) => {
      state.leavesByPeriod = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.leaves = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch leaves';
      })
      .addCase(fetchActiveLeaves.fulfilled, (state, action) => {
        state.activeLeaves = action.payload;
      })
      .addCase(fetchTodayLeaves.fulfilled, (state, action) => {
        state.todayLeaves = action.payload;
      })
      .addCase(fetchEmployeeLeaves.fulfilled, (state, action) => {
        state.employeeLeaves = action.payload;
      })
      .addCase(fetchLeavesByPeriod.fulfilled, (state, action) => {
        state.leavesByPeriod = action.payload;
      })
      .addCase(fetchLeavesStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createLeave.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.leaves.push(action.payload);
        state.activeLeaves.push(action.payload);
        state.status = 'idle';
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to create leave';
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(
          leave => leave.leaveId === (action.payload as any).leaveId
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        
        const activeIndex = state.activeLeaves.findIndex(
          leave => leave.leaveId === (action.payload as any).leaveId
        );
        if (activeIndex !== -1) {
          state.activeLeaves[activeIndex] = action.payload;
        }
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter(
          leave => leave.leaveId !== action.payload
        );
        state.activeLeaves = state.activeLeaves.filter(
          leave => leave.leaveId !== action.payload
        );
      });
  },
});

export const { clearEmployeeLeaves, clearLeavesByPeriod } = leavesSlice.actions;
export default leavesSlice.reducer;