import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createEmployee = createAsyncThunk(
  'employees/createEmployeeStatus',
  async (formData: FormData) => {
    const { data } = await axios.post('http://localhost:3000/api/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
);

export const fetchWorkTypes = createAsyncThunk(
  'employees/fetchWorkTypesStatus',
  async (serviceTypeId: number) => {
    const { data } = await axios.get(`http://localhost:3000/api/employees/work-types/${serviceTypeId}`);
    return data as any[];
  }
);

export const fetchAllEmployees = createAsyncThunk(
  'employees/fetchAllEmployeesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/api/employees');
    return data as any[];
  }
);

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
    builder
      .addCase(createEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.status = 'success';
        state.employees.push(action.payload as any);
        state.successMessage = 'Сотрудник успешно добавлен!';
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Ошибка при добавлении сотрудника';
      })
      .addCase(fetchWorkTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorkTypes.fulfilled, (state, action) => {
        state.workTypes = action.payload;
        state.status = 'success';
      })
      .addCase(fetchWorkTypes.rejected, (state) => {
        state.status = 'error';
        state.workTypes = [];
      })
      .addCase(fetchAllEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.status = 'success';
      })
      .addCase(fetchAllEmployees.rejected, (state) => {
        state.status = 'error';
        state.employees = [];
      });
  },
});

export const { clearError, clearSuccessMessage, resetStatus } = employeesSlice.actions;
export default employeesSlice.reducer;