import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Интерфейсы для ответов бэкенда
interface ApiLeave {
  leaveId: number;
  employee: {
    personalNumber: number;
    fullName: string;
    position?: string;
  } | null;
  leaveType: {
    leaveTypeId: number;
    leaveTypeName: string;
    description?: string;
  } | null;
  startDate: string;
  endDate: string;
}

interface ApiLeaveType {
  leaveTypeId: number;
  leaveTypeName: string;
  description?: string;
}

interface ApiEmployee {
  personalNumber: number;
  fullName: string;
  position?: string;
}

interface ApiLeaveStats {
  total: number;
  active: number;
  completed: number;
  monthlyStats: any[];
  typeStats: any[];
}

// Интерфейсы для фронтенда
export interface Leave {
  leaveId: number;
  employee: {
    personalNumber: number;
    fullName: string;
    position?: string;
  };
  leaveType: {
    leaveTypeId: number;
    leaveTypeName: string;
    description?: string;
  };
  startDate: string;
  endDate: string;
}

export interface LeaveFormData {
  leaveId?: number;
  employeePersonalNumber: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
}

// Преобразование с проверкой на null
const transformApiLeave = (apiLeave: ApiLeave): Leave | null => {
  try {
    if (!apiLeave) {
      console.warn('Empty leave data');
      return null;
    }
    
    const employee = apiLeave.employee || {
      personalNumber: 0,
      fullName: 'Неизвестный сотрудник',
      position: 'Не указана'
    };
    
    const leaveType = apiLeave.leaveType || {
      leaveTypeId: 0,
      leaveTypeName: 'Неизвестный тип',
      description: ''
    };
    
    if (!apiLeave.startDate || !apiLeave.endDate) {
      console.warn('Missing dates for leave:', apiLeave.leaveId);
      return null;
    }
    
    return {
      leaveId: apiLeave.leaveId,
      employee: {
        personalNumber: employee.personalNumber,
        fullName: employee.fullName,
        position: employee.position
      },
      leaveType: {
        leaveTypeId: leaveType.leaveTypeId,
        leaveTypeName: leaveType.leaveTypeName,
        description: leaveType.description
      },
      startDate: apiLeave.startDate,
      endDate: apiLeave.endDate
    };
  } catch (error) {
    console.error('Error transforming leave:', error, apiLeave);
    return null;
  }
};

const transformApiLeaveType = (apiType: ApiLeaveType) => ({
  leaveTypeId: apiType.leaveTypeId,
  leaveTypeName: apiType.leaveTypeName,
  description: apiType.description
});

// const transformApiEmployee = (apiEmployee: ApiEmployee) => ({
//   personalNumber: apiEmployee.personalNumber,
//   fullName: apiEmployee.fullName,
//   position: apiEmployee.position
// });



export interface Employee {
  personalNumber: number;
  fullName: string;
  position?: string;
}

// Обновленный вариант transformApiEmployee чтобы использовать экспортируемый интерфейс
const transformApiEmployee = (apiEmployee: ApiEmployee): Employee => ({
  personalNumber: apiEmployee.personalNumber,
  fullName: apiEmployee.fullName,
  position: apiEmployee.position
});


// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для отладки запросов/ответов
api.interceptors.request.use(
  config => {
    console.log('Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.config.url);
    
    // Безопасная проверка типа данных
    if (Array.isArray(response.data)) {
      console.log('Data length:', response.data.length);
    } else if (response.data && typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      console.log('Data keys:', keys);
    } else {
      console.log('Data:', response.data);
    }
    
    return response;
  },
  error => {
    console.error('Response error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeavesStatus',
  async (searchQuery?: string) => {
    try {
      const url = searchQuery 
        ? `/leaves?search=${encodeURIComponent(searchQuery)}`
        : '/leaves';
      console.log('Fetching leaves from:', url);
      const response = await api.get<ApiLeave[]>(url);
      
      // Проверяем данные
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        throw new Error('Invalid response format');
      }
      
      console.log('Leaves API response length:', response.data.length);
      
      // Преобразуем и фильтруем данные
      const transformedLeaves = response.data
        .map(transformApiLeave)
        .filter((leave): leave is Leave => leave !== null);
      
      console.log('Successfully transformed leaves:', transformedLeaves.length);
      
      if (transformedLeaves.length < response.data.length) {
        console.warn(`Filtered out ${response.data.length - transformedLeaves.length} invalid leaves`);
      }
      
      return transformedLeaves;
    } catch (error: any) {
      console.error('Error fetching leaves:', error.response?.data || error.message);
      throw error;
    }
  }
);

export const fetchLeaveStats = createAsyncThunk(
  'leaves/fetchLeaveStatsStatus',
  async () => {
    try {
      const { data } = await api.get<ApiLeaveStats>('/leaves/stats');
      return data;
    } catch (error: any) {
      console.error('Error fetching leave stats:', error);
      throw error;
    }
  }
);

export const fetchLeaveTypes = createAsyncThunk(
  'leaves/fetchLeaveTypesStatus',
  async () => {
    try {
      const { data } = await api.get<ApiLeaveType[]>('/leave-types');
      return data.map(transformApiLeaveType);
    } catch (error: any) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }
);

export const fetchEmployees = createAsyncThunk(
  'leaves/fetchEmployeesStatus',
  async (searchQuery?: string) => {
    try {
      const url = searchQuery 
        ? `/api/employees?search=${encodeURIComponent(searchQuery)}`
        : '/api/employees';
      const { data } = await api.get<ApiEmployee[]>(url);
      return data.map(transformApiEmployee);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }
);


export const createLeave = createAsyncThunk(
  'leaves/createLeaveStatus',
  async (leaveData: Omit<LeaveFormData, 'leaveId'>) => {
    try {
      // Преобразуем строки в числа
      const apiData = {
        employeePersonalNumber: Number(leaveData.employeePersonalNumber),
        leaveTypeId: Number(leaveData.leaveTypeId),
        startDate: leaveData.startDate,
        endDate: leaveData.endDate
      };
      
      console.log('Sending to API:', apiData);
      console.log('Data types:', {
        employeePersonalNumber: typeof apiData.employeePersonalNumber,
        leaveTypeId: typeof apiData.leaveTypeId,
        startDate: typeof apiData.startDate,
        endDate: typeof apiData.endDate,
      });
      
      const { data } = await api.post<ApiLeave>('/leaves', apiData);
      const transformed = transformApiLeave(data);
      if (!transformed) {
        throw new Error('Failed to transform created leave');
      }
      return transformed;
    } catch (error: any) {
      console.error('Error creating leave:', error);
      throw error;
    }
  }
);

export const updateLeave = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ id, ...updateData }: { id: number } & Partial<LeaveFormData>) => {
    try {
      const processedData: any = {};
      // Исправьте названия полей в соответствии с DTO на бэкенде
      if (updateData.leaveTypeId) processedData.leaveTypeId = Number(updateData.leaveTypeId);
      if (updateData.startDate) processedData.startDate = updateData.startDate;
      if (updateData.endDate) processedData.endDate = updateData.endDate;
      
      console.log('Updating leave:', id, processedData);
      
      const { data } = await api.put<ApiLeave>(`/leaves/${id}`, processedData);
      console.log('Update response:', data);
      
      const transformed = transformApiLeave(data);
      if (!transformed) {
        throw new Error('Failed to transform updated leave');
      }
      return transformed;
    } catch (error: any) {
      console.error('Error updating leave:', error);
      throw error;
    }
  }
);

export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeaveStatus',
  async (id: number) => {
    try {
      console.log('Deleting leave with ID:', id);
      await api.delete(`/leaves/${id}`);
      console.log('Successfully deleted leave:', id);
      return id;
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      throw error;
    }
  }
);

interface LeaveState {
  leaves: Leave[];
  leaveTypes: ReturnType<typeof transformApiLeaveType>[];
  employees: ReturnType<typeof transformApiEmployee>[];
  stats: ApiLeaveStats | null;
  status: 'idle' | 'loading' | 'error';
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  successMessage: string | null;
  searchQuery: string;
}

const initialState: LeaveState = {
  leaves: [],
  leaveTypes: [],
  employees: [],
  stats: null,
  status: 'idle',
  deleteStatus: 'idle',
  error: null,
  successMessage: null,
  searchQuery: '',
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
    setSearchQuery: (state, action: { payload: string }) => {
      state.searchQuery = action.payload;
    },
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
      
      .addCase(fetchLeaveTypes.pending, (state) => {
        // Не меняем общий статус при загрузке типов отпусков
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        console.error('Failed to fetch leave types:', action.error.message);
      })
      
      .addCase(fetchEmployees.pending, (state) => {
        // Не меняем общий статус при загрузке сотрудников
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        console.error('Failed to fetch employees:', action.error.message);
      })
      
      .addCase(fetchLeaveStats.pending, (state) => {
        // Не меняем общий статус при загрузке статистики
      })
      .addCase(fetchLeaveStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchLeaveStats.rejected, (state, action) => {
        console.error('Failed to fetch leave stats:', action.error.message);
      })
      
      .addCase(deleteLeave.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter(
          leave => leave.leaveId !== action.payload
        );
        state.deleteStatus = 'succeeded';
        state.successMessage = 'Отпуск успешно удален';
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.error.message || 'Failed to delete leave';
      })
      
      .addCase(createLeave.pending, (state) => {
        state.status = 'loading';
      })
// В leavesSlice.ts в extraReducers:
.addCase(createLeave.fulfilled, (state, action) => {
  // Добавляем новый отпуск в начало списка
  state.leaves.unshift(action.payload);
  state.status = 'idle';
  state.successMessage = `Отпуск успешно добавлен для сотрудника ${action.payload.employee.fullName}`;
  
  // Обновляем статистику
  if (state.stats) {
    state.stats.total += 1;
    
    // Проверяем, активный ли отпуск (дата окончания >= сегодня)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(action.payload.endDate);
    
    if (endDate >= today) {
      state.stats.active += 1;
    } else {
      state.stats.completed += 1;
    }
  }
})
      .addCase(createLeave.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message || 'Failed to create leave';
      })
      
      .addCase(updateLeave.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(
          leave => leave.leaveId === action.payload.leaveId
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        state.status = 'idle';
        state.successMessage = 'Отпуск успешно обновлен';
      })
      .addCase(updateLeave.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message || 'Failed to update leave';
      });
  },
});

export const { 
  clearSuccessMessage, 
  resetDeleteStatus,
  setSearchQuery 
} = leavesSlice.actions;
export default leavesSlice.reducer;