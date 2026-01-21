import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронные thunks (как в вашем примере с котами)
export const createEmployee = createAsyncThunk(
  'employees/createEmployeeStatus',
  async (formData: FormData) => {
    const { data } = await axios.post('http://localhost:3000/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Сотрудник создан:', data);
    return data;
  }
);

export const fetchWorkTypes = createAsyncThunk(
  'employees/fetchWorkTypesStatus',
  async (serviceTypeId: number) => {
    const { data } = await axios.get(`http://localhost:3000/employees/work-types/${serviceTypeId}`);
    console.log('Виды работ получены:', data);
    return data;
  }
);

export const fetchAllEmployees = createAsyncThunk(
  'employees/fetchAllEmployeesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/employees');
    console.log('Все сотрудники:', data);
    return data;
  }
);

// Типы (как в вашем примере)
export type Employee = {
  personal_number: number;
  full_name: string;
  position: string;
  service_type_id: number;
  work_type_id: number;
  service_type_name?: string;
  work_type_name?: string;
  brigada_id?: number;
  brigada_name?: string;
  locomotive_id?: string;
  locomotive_name?: string;
  birthday?: number;
  phone?: string;
  has_trip: boolean;
  has_craneman: boolean;
  diesel_access: boolean;
  electric_access: boolean;
  photo_path?: string;
  photo_filename?: string;
  photo_mimetype?: string;
};

export type WorkType = {
  work_type_id: number;
  work_type_name: string;
};

// Состояние (как в вашем примере)
interface EmployeesState {
  employees: Employee[];
  workTypes: WorkType[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  successMessage: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  workTypes: [],
  status: 'idle',
  error: null,
  successMessage: null,
};

// Создаем slice (как в вашем примере)
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
  },
  extraReducers: (builder) => {
    // Создание сотрудника
    builder.addCase(createEmployee.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(createEmployee.fulfilled, (state, action) => {
      state.status = 'success';
      state.employees.push(action.payload.employee);
      state.successMessage = 'Сотрудник успешно добавлен!';
    });
    builder.addCase(createEmployee.rejected, (state, action) => {
      state.status = 'error';
      state.error = action.error.message || 'Ошибка при добавлении сотрудника';
    });

    // Получение видов работ
    builder.addCase(fetchWorkTypes.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchWorkTypes.fulfilled, (state, action) => {
      state.workTypes = action.payload;
      state.status = 'success';
    });
    builder.addCase(fetchWorkTypes.rejected, (state) => {
      state.status = 'error';
      state.workTypes = [];
    });

    // Получение всех сотрудников
    builder.addCase(fetchAllEmployees.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchAllEmployees.fulfilled, (state, action) => {
      state.employees = action.payload;
      state.status = 'success';
    });
    builder.addCase(fetchAllEmployees.rejected, (state) => {
      state.status = 'error';
      state.employees = [];
    });
  },
});

export const { clearError, clearSuccessMessage, resetStatus } = employeesSlice.actions;
export default employeesSlice.reducer;