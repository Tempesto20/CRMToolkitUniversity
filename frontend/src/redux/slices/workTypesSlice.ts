import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchWorkTypes = createAsyncThunk(
  'workTypes/fetchWorkTypesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/work-types');
    return data;
  }
);

export const fetchWorkTypesByService = createAsyncThunk(
  'workTypes/fetchWorkTypesByServiceStatus',
  async (serviceTypeId: number) => {
    const { data } = await axios.get(`http://localhost:3000/work-types/by-service/${serviceTypeId}`);
    return data;
  }
);

export const createWorkType = createAsyncThunk(
  'workTypes/createWorkTypeStatus',
  async (workTypeData: { workTypeId: number; workTypeName: string }) => {
    const { data } = await axios.post('http://localhost:3000/work-types', workTypeData);
    return data;
  }
);

export const updateWorkType = createAsyncThunk(
  'workTypes/updateWorkTypeStatus',
  async ({ id, workTypeName }: { id: number; workTypeName: string }) => {
    const { data } = await axios.put(`http://localhost:3000/work-types/${id}`, {
      workTypeName
    });
    return data;
  }
);

export const deleteWorkType = createAsyncThunk(
  'workTypes/deleteWorkTypeStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/work-types/${id}`);
    return id;
  }
);

interface WorkTypeState {
  workTypes: any[];
  workTypesByService: any[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: WorkTypeState = {
  workTypes: [],
  workTypesByService: [],
  status: 'idle',
  error: null,
};

const workTypesSlice = createSlice({
  name: 'workTypes',
  initialState,
  reducers: {
    clearWorkTypesByService: (state) => {
      state.workTypesByService = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Получение всех видов работ
      .addCase(fetchWorkTypes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkTypes.fulfilled, (state, action) => {
        state.workTypes = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchWorkTypes.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch work types';
      })
      // Получение видов работ по службе
      .addCase(fetchWorkTypesByService.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorkTypesByService.fulfilled, (state, action) => {
        state.workTypesByService = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchWorkTypesByService.rejected, (state) => {
        state.status = 'error';
        state.workTypesByService = [];
      })
      // Создание вида работ
      .addCase(createWorkType.fulfilled, (state, action) => {
        state.workTypes.push(action.payload);
      })
      // Обновление вида работ
      .addCase(updateWorkType.fulfilled, (state, action) => {
        const index = state.workTypes.findIndex(
          wt => wt.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.workTypes[index] = action.payload;
        }
      })
      // Удаление вида работ
      .addCase(deleteWorkType.fulfilled, (state, action) => {
        state.workTypes = state.workTypes.filter(
          wt => wt.workTypeId !== action.payload
        );
      });
  },
});

export const { clearWorkTypesByService } = workTypesSlice.actions;
export default workTypesSlice.reducer;