// frontend/src/redux/slices/employeesSlice.ts
import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:3000';

// Асинхронные thunks
export const createEmployee = createAsyncThunk(
  'employees/createEmployeeStatus',
  async (formData: FormData) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/employees`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployeeStatus',
  async ({ personalNumber, formData }: { personalNumber: number; formData: FormData }) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/employees/${personalNumber}`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  }
);

export const fetchServiceTypes = createAsyncThunk(
  'employees/fetchServiceTypesStatus',
  async () => {
    const { data } = await axios.get(`${API_BASE_URL}/service-types`);
    return data as any[];
  }
);

export const fetchWorkTypesByService = createAsyncThunk(
  'employees/fetchWorkTypesByServiceStatus',
  async (serviceTypeId: number) => {
    const { data } = await axios.get(`${API_BASE_URL}/api/employees/work-types/${serviceTypeId}`);
    return data as any[];
  }
);

export const fetchBrigadas = createAsyncThunk(
  'employees/fetchBrigadasStatus',
  async () => {
    const { data } = await axios.get(`${API_BASE_URL}/brigada`);
    return data as any[];
  }
);

export const fetchLocomotives = createAsyncThunk(
  'employees/fetchLocomotivesStatus',
  async () => {
    const { data } = await axios.get(`${API_BASE_URL}/locomotives`);
    return data as any[];
  }
);

export const fetchAllEmployees = createAsyncThunk(
  'employees/fetchAllEmployeesStatus',
  async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/employees`);
    return data as any[];
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployeeStatus',
  async (personalNumber: number) => {
    await axios.delete(`${API_BASE_URL}/api/employees/${personalNumber}`);
    return personalNumber;
  }
);

// Интерфейсы
export interface ServiceType {
  serviceTypeId: number;
  serviceTypeName: string;
}

export interface WorkType {
  workTypeId: number;
  workTypeName: string;
}

export interface Brigada {
  brigadaId: number;
  brigadaName: string;
}

export interface Locomotive {
  locomotiveId: string;
  locomotiveName: string;
  locomotiveType?: string;
  locomotiveDepo?: boolean;
  operationalStatus?: boolean;
  locationId?: number;
  serviceTypeId?: number;
  workTypeId?: number;
}

export interface Employee {
  personalNumber: number;
  fullName: string;
  position: string;
  serviceTypeId: number;
  workTypeId: number;
  serviceType?: ServiceType;
  workType?: WorkType;
  brigadaId?: number;
  brigada?: Brigada;
  locomotiveId?: string;
  locomotive?: Locomotive;
  birthday?: number;
  phone?: string;
  hasTrip: boolean;
  hasCraneman: boolean;
  dieselAccess: boolean;
  electricAccess: boolean;
  photoPath?: string;
  photoFilename?: string;
  photoMimetype?: string;
}

interface EmployeesState {
  employees: Employee[];
  serviceTypes: ServiceType[];
  workTypes: WorkType[];
  brigadas: Brigada[];
  locomotives: Locomotive[];
  positions: string[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  successMessage: string | null;
  deleteStatus: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: EmployeesState = {
  employees: [],
  serviceTypes: [],
  workTypes: [],
  brigadas: [],
  locomotives: [],
  positions: [],
  status: 'idle',
  error: null,
  successMessage: null,
  deleteStatus: 'idle',
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
    },
    extractPositionsFromEmployees: (state) => {
      const positionsSet = new Set<string>();
      state.employees.forEach(employee => {
        if (employee.position && employee.position.trim() !== '') {
          positionsSet.add(employee.position);
        }
      });
      state.positions = Array.from(positionsSet).sort();
    },
  },
  extraReducers: (builder) => {
    builder
      // Создание сотрудника
      .addCase(createEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.status = 'success';
        state.employees.push(action.payload as any);
        state.successMessage = 'Сотрудник успешно добавлен!';
        
        const newEmployee = action.payload as Employee;
        if (newEmployee.position && !state.positions.includes(newEmployee.position)) {
          state.positions.push(newEmployee.position);
          state.positions.sort();
        }
      })
      .addCase(createEmployee.rejected, (state, action: any) => {
        state.status = 'error';
        state.error = action.error?.message || 'Ошибка при добавлении сотрудника';
      })
      
      // Обновление сотрудника
      .addCase(updateEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.status = 'success';
        const updatedEmployee = action.payload as Employee;
        const index = state.employees.findIndex(
          emp => emp.personalNumber === updatedEmployee.personalNumber
        );
        if (index !== -1) {
          state.employees[index] = updatedEmployee;
        }
        state.successMessage = 'Сотрудник успешно обновлен!';
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Ошибка при обновлении сотрудника';
      })
      
      // Загрузка служб
      .addCase(fetchServiceTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.serviceTypes = action.payload;
        state.status = 'success';
      })
      .addCase(fetchServiceTypes.rejected, (state) => {
        state.status = 'error';
        state.serviceTypes = [];
      })
      
      // Загрузка видов работ по службе
      .addCase(fetchWorkTypesByService.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorkTypesByService.fulfilled, (state, action) => {
        state.workTypes = action.payload;
        state.status = 'success';
      })
      .addCase(fetchWorkTypesByService.rejected, (state) => {
        state.status = 'error';
        state.workTypes = [];
      })
      
      // Загрузка бригад
      .addCase(fetchBrigadas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBrigadas.fulfilled, (state, action) => {
        state.brigadas = action.payload;
        state.status = 'success';
      })
      .addCase(fetchBrigadas.rejected, (state) => {
        state.status = 'error';
        state.brigadas = [];
      })
      
      // Загрузка локомотивов
      .addCase(fetchLocomotives.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocomotives.fulfilled, (state, action) => {
        state.locomotives = action.payload;
        state.status = 'success';
      })
      .addCase(fetchLocomotives.rejected, (state) => {
        state.status = 'error';
        state.locomotives = [];
      })
      
      // Загрузка всех сотрудников
      .addCase(fetchAllEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.status = 'success';
        
        const positionsSet = new Set<string>();
        action.payload.forEach((employee: Employee) => {
          if (employee.position && employee.position.trim() !== '') {
            positionsSet.add(employee.position);
          }
        });
        state.positions = Array.from(positionsSet).sort();
      })
      .addCase(fetchAllEmployees.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Ошибка загрузки сотрудников';
        state.employees = [];
      })
      
      // Удаление сотрудника
      .addCase(deleteEmployee.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          employee => employee.personalNumber !== action.payload
        );
        state.deleteStatus = 'success';
        state.successMessage = 'Сотрудник успешно удален!';
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.deleteStatus = 'error';
        state.error = action.error.message || 'Ошибка при удалении сотрудника';
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  resetStatus, 
  resetDeleteStatus,
  extractPositionsFromEmployees 
} = employeesSlice.actions;
export default employeesSlice.reducer;