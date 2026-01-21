import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLocomotives = createAsyncThunk(
  'locomotives/fetchLocomotivesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/locomotives');
    return data as any[];
  }
);

export const fetchAvailableLocomotives = createAsyncThunk(
  'locomotives/fetchAvailableLocomotivesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/locomotives/available');
    return data as any[];
  }
);

export const fetchLocomotivesByService = createAsyncThunk(
  'locomotives/fetchLocomotivesByServiceStatus',
  async (serviceTypeId: number) => {
    const { data } = await axios.get(`http://localhost:3000/locomotives/by-service/${serviceTypeId}`);
    return data as any[];
  }
);

export const createLocomotive = createAsyncThunk(
  'locomotives/createLocomotiveStatus',
  async (locomotiveData: any) => {
    const { data } = await axios.post('http://localhost:3000/locomotives', locomotiveData);
    return data;
  }
);

export const updateLocomotive = createAsyncThunk(
  'locomotives/updateLocomotiveStatus',
  async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
    const { data } = await axios.put(`http://localhost:3000/locomotives/${id}`, updateData);
    return data;
  }
);

export const deleteLocomotive = createAsyncThunk(
  'locomotives/deleteLocomotiveStatus',
  async (id: string) => {
    await axios.delete(`http://localhost:3000/locomotives/${id}`);
    return id;
  }
);

export const fetchLocomotiveStats = createAsyncThunk(
  'locomotives/fetchLocomotiveStatsStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/locomotives/stats');
    return data;
  }
);

interface LocomotiveState {
  locomotives: any[];
  availableLocomotives: any[];
  locomotivesByService: any[];
  stats: any;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: LocomotiveState = {
  locomotives: [],
  availableLocomotives: [],
  locomotivesByService: [],
  stats: null,
  status: 'idle',
  error: null,
};

const locomotivesSlice = createSlice({
  name: 'locomotives',
  initialState,
  reducers: {
    clearLocomotivesByService: (state) => {
      state.locomotivesByService = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocomotives.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLocomotives.fulfilled, (state, action) => {
        state.locomotives = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchLocomotives.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch locomotives';
      })
      .addCase(fetchAvailableLocomotives.fulfilled, (state, action) => {
        state.availableLocomotives = action.payload;
      })
      .addCase(fetchLocomotivesByService.fulfilled, (state, action) => {
        state.locomotivesByService = action.payload;
      })
      .addCase(fetchLocomotiveStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createLocomotive.fulfilled, (state, action) => {
        state.locomotives.push(action.payload);
      })
      .addCase(updateLocomotive.fulfilled, (state, action) => {
        const index = state.locomotives.findIndex(
          loc => loc.locomotiveId === (action.payload as any).locomotiveId
        );
        if (index !== -1) {
          state.locomotives[index] = action.payload;
        }
      })
      .addCase(deleteLocomotive.fulfilled, (state, action) => {
        state.locomotives = state.locomotives.filter(
          loc => loc.locomotiveId !== action.payload
        );
      });
  },
});

export const { clearLocomotivesByService } = locomotivesSlice.actions;
export default locomotivesSlice.reducer;