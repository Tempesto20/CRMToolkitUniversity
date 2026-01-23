import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Интерфейсы для данных
interface EmployeeDetails {
  personalNumber: number;
  fullName: string;
  position?: string;
  serviceType?: {
    serviceTypeName: string;
  };
  brigada?: {
    brigadaName: string;
  };
}

interface LeaveTypeDetails {
  leave_type_id: number;
  leave_type_name: string;
  description: string;
}

interface LeaveWithDetails {
  leave_id: number;
  employee_personal_number: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  employee?: EmployeeDetails;
  leaveType?: LeaveTypeDetails;
  leave_type_name?: string;
}

interface Leave {
  leave_id: number;
  employee_personal_number: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  leave_type_name?: string;
  employee_full_name?: string;
  leave_type_description?: string;
}

interface LeaveType {
  leave_type_id: number;
  leave_type_name: string;
  description: string;
}

interface LeaveStats {
  total: number;
  active: number;
  today: number;
  byType: Record<string, number>;
}

// Async thunks для данных с деталями
export const fetchLeavesWithDetails = createAsyncThunk<LeaveWithDetails[]>(
  'leaves/fetchLeavesWithDetailsStatus',
  async () => {
    const { data } = await axios.get<LeaveWithDetails[]>('http://localhost:3000/leaves/with-details');
    return data;
  }
);

export const fetchActiveLeavesWithDetails = createAsyncThunk<LeaveWithDetails[]>(
  'leaves/fetchActiveLeavesWithDetailsStatus',
  async () => {
    const { data } = await axios.get<LeaveWithDetails[]>('http://localhost:3000/leaves/active/with-details');
    return data;
  }
);

export const fetchTodayLeavesWithDetails = createAsyncThunk<LeaveWithDetails[]>(
  'leaves/fetchTodayLeavesWithDetailsStatus',
  async () => {
    const { data } = await axios.get<LeaveWithDetails[]>('http://localhost:3000/leaves/today/with-details');
    return data;
  }
);

export const fetchEmployeeLeavesWithDetails = createAsyncThunk<LeaveWithDetails[], number>(
  'leaves/fetchEmployeeLeavesWithDetailsStatus',
  async (personalNumber: number) => {
    const { data } = await axios.get<LeaveWithDetails[]>(`http://localhost:3000/leaves/employee/${personalNumber}/with-details`);
    return data;
  }
);

export const fetchLeavesByPeriodWithDetails = createAsyncThunk<LeaveWithDetails[], { startDate: string; endDate: string }>(
  'leaves/fetchLeavesByPeriodWithDetailsStatus',
  async ({ startDate, endDate }) => {
    const { data } = await axios.get<LeaveWithDetails[]>(`http://localhost:3000/leaves/period/with-details?start=${startDate}&end=${endDate}`);
    return data;
  }
);

// Существующие thunks
export const fetchLeaves = createAsyncThunk<Leave[]>(
  'leaves/fetchLeavesStatus',
  async () => {
    const { data } = await axios.get<Leave[]>('http://localhost:3000/leaves');
    return data;
  }
);

export const fetchActiveLeaves = createAsyncThunk<Leave[]>(
  'leaves/fetchActiveLeavesStatus',
  async () => {
    const { data } = await axios.get<Leave[]>('http://localhost:3000/leaves/active');
    return data;
  }
);

export const fetchTodayLeaves = createAsyncThunk<Leave[]>(
  'leaves/fetchTodayLeavesStatus',
  async () => {
    const { data } = await axios.get<Leave[]>('http://localhost:3000/leaves/today');
    return data;
  }
);

export const fetchEmployeeLeaves = createAsyncThunk<Leave[], number>(
  'leaves/fetchEmployeeLeavesStatus',
  async (personalNumber: number) => {
    const { data } = await axios.get<Leave[]>(`http://localhost:3000/leaves/employee/${personalNumber}`);
    return data;
  }
);

export const fetchLeavesByPeriod = createAsyncThunk<Leave[], { startDate: string; endDate: string }>(
  'leaves/fetchLeavesByPeriodStatus',
  async ({ startDate, endDate }) => {
    const { data } = await axios.get<Leave[]>(`http://localhost:3000/leaves/period?start=${startDate}&end=${endDate}`);
    return data;
  }
);

export const fetchLeavesStats = createAsyncThunk<LeaveStats>(
  'leaves/fetchLeavesStatsStatus',
  async () => {
    const { data } = await axios.get<LeaveStats>('http://localhost:3000/leaves/stats');
    return data;
  }
);

export const createLeave = createAsyncThunk<Leave, any>(
  'leaves/createLeaveStatus',
  async (leaveData: any) => {
    const { data } = await axios.post<Leave>('http://localhost:3000/leaves', leaveData);
    return data;
  }
);

export const updateLeave = createAsyncThunk<Leave, { id: number; [key: string]: any }>(
  'leaves/updateLeaveStatus',
  async ({ id, ...updateData }) => {
    const { data } = await axios.put<Leave>(`http://localhost:3000/leaves/${id}`, updateData);
    return data;
  }
);

export const deleteLeave = createAsyncThunk<number, number>(
  'leaves/deleteLeaveStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/leaves/${id}`);
    return id;
  }
);

// Интерфейс состояния
interface LeavesState {
  leaves: Leave[];
  leavesWithDetails: LeaveWithDetails[];
  activeLeaves: Leave[];
  activeLeavesWithDetails: LeaveWithDetails[];
  todayLeaves: Leave[];
  todayLeavesWithDetails: LeaveWithDetails[];
  employeeLeaves: Leave[];
  employeeLeavesWithDetails: LeaveWithDetails[];
  leavesByPeriod: Leave[];
  leavesByPeriodWithDetails: LeaveWithDetails[];
  stats: LeaveStats | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  successMessage: string | null;
  deleteStatus: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: LeavesState = {
  leaves: [],
  leavesWithDetails: [],
  activeLeaves: [],
  activeLeavesWithDetails: [],
  todayLeaves: [],
  todayLeavesWithDetails: [],
  employeeLeaves: [],
  employeeLeavesWithDetails: [],
  leavesByPeriod: [],
  leavesByPeriodWithDetails: [],
  stats: null,
  status: 'idle',
  error: null,
  successMessage: null,
  deleteStatus: 'idle',
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
    },
    clearEmployeeLeaves: (state) => {
      state.employeeLeaves = [];
      state.employeeLeavesWithDetails = [];
    },
    clearLeavesByPeriod: (state) => {
      state.leavesByPeriod = [];
      state.leavesByPeriodWithDetails = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка данных с деталями
      .addCase(fetchLeavesWithDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeavesWithDetails.fulfilled, (state, action) => {
        state.leavesWithDetails = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchLeavesWithDetails.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Не удалось загрузить отпуски с деталями';
      })
      .addCase(fetchActiveLeavesWithDetails.fulfilled, (state, action) => {
        state.activeLeavesWithDetails = action.payload;
      })
      .addCase(fetchTodayLeavesWithDetails.fulfilled, (state, action) => {
        state.todayLeavesWithDetails = action.payload;
      })
      .addCase(fetchEmployeeLeavesWithDetails.fulfilled, (state, action) => {
        state.employeeLeavesWithDetails = action.payload;
      })
      .addCase(fetchLeavesByPeriodWithDetails.fulfilled, (state, action) => {
        state.leavesByPeriodWithDetails = action.payload;
      })
      
      // Существующие обработчики
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
        state.error = action.error.message || 'Не удалось загрузить отпуски';
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
        state.error = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.leaves.push(action.payload);
        state.activeLeaves.push(action.payload);
        state.status = 'idle';
        state.successMessage = 'Отпуск успешно создан';
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Не удалось создать отпуск';
      })
      .addCase(updateLeave.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(
          leave => leave.leave_id === action.payload.leave_id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        
        const activeIndex = state.activeLeaves.findIndex(
          leave => leave.leave_id === action.payload.leave_id
        );
        if (activeIndex !== -1) {
          state.activeLeaves[activeIndex] = action.payload;
        }
        
        const todayIndex = state.todayLeaves.findIndex(
          leave => leave.leave_id === action.payload.leave_id
        );
        if (todayIndex !== -1) {
          state.todayLeaves[todayIndex] = action.payload;
        }
        
        state.status = 'idle';
        state.successMessage = 'Отпуск успешно обновлен';
      })
      .addCase(updateLeave.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Не удалось обновить отпуск';
      })
      .addCase(deleteLeave.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter(
          leave => leave.leave_id !== action.payload
        );
        state.activeLeaves = state.activeLeaves.filter(
          leave => leave.leave_id !== action.payload
        );
        state.todayLeaves = state.todayLeaves.filter(
          leave => leave.leave_id !== action.payload
        );
        state.deleteStatus = 'success';
        state.successMessage = 'Отпуск успешно удален';
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.deleteStatus = 'error';
        state.error = action.error.message || 'Не удалось удалить отпуск';
      });
  },
});

export const { 
  clearSuccessMessage, 
  resetDeleteStatus,
  clearEmployeeLeaves, 
  clearLeavesByPeriod 
} = leavesSlice.actions;
export default leavesSlice.reducer;