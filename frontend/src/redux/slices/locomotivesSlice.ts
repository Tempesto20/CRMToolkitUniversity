import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLocomotives = createAsyncThunk(
  'locomotives/fetchLocomotivesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/locomotives');
    return data as any[];
  }
);

export const fetchServiceTypes = createAsyncThunk(
  'locomotives/fetchServiceTypesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/service-types');
    return data as any[];
  }
);

export const fetchWorkTypes = createAsyncThunk(
  'locomotives/fetchWorkTypesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/work-types');
    return data as any[];
  }
);

export const fetchLocationWork = createAsyncThunk(
  'locomotives/fetchLocationWorkStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/location-work');
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
  serviceTypes: any[];
  workTypes: any[];
  locations: any[];
  availableLocomotives: any[];
  locomotivesByService: any[];
  stats: any;
  status: 'idle' | 'loading' | 'error';
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  successMessage: string | null;
}

const initialState: LocomotiveState = {
  locomotives: [],
  serviceTypes: [],
  workTypes: [],
  locations: [],
  availableLocomotives: [],
  locomotivesByService: [],
  stats: null,
  status: 'idle',
  deleteStatus: 'idle',
  error: null,
  successMessage: null,
};

const locomotivesSlice = createSlice({
  name: 'locomotives',
  initialState,
  reducers: {
    clearLocomotivesByService: (state) => {
      state.locomotivesByService = [];
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
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
      
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.serviceTypes = action.payload;
      })
      
      .addCase(fetchWorkTypes.fulfilled, (state, action) => {
        state.workTypes = action.payload;
      })
      
      .addCase(fetchLocationWork.fulfilled, (state, action) => {
        state.locations = action.payload;
      })
      
      .addCase(deleteLocomotive.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteLocomotive.fulfilled, (state, action) => {
        state.locomotives = state.locomotives.filter(
          loc => loc.locomotiveId !== action.payload
        );
        state.deleteStatus = 'succeeded';
        state.successMessage = 'Локомотив успешно удален';
      })
      .addCase(deleteLocomotive.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.error.message || 'Failed to delete locomotive';
      })
      
      .addCase(createLocomotive.fulfilled, (state, action) => {
        state.locomotives.push(action.payload);
        state.successMessage = 'Локомотив успешно добавлен';
      })
      .addCase(updateLocomotive.fulfilled, (state, action) => {
        const index = state.locomotives.findIndex(
          loc => loc.locomotiveId === (action.payload as any).locomotiveId
        );
        if (index !== -1) {
          state.locomotives[index] = action.payload;
        }
        state.successMessage = 'Локомотив успешно обновлен';
      })
      
      .addCase(fetchAvailableLocomotives.fulfilled, (state, action) => {
        state.availableLocomotives = action.payload;
      })
      .addCase(fetchLocomotivesByService.fulfilled, (state, action) => {
        state.locomotivesByService = action.payload;
      })
      .addCase(fetchLocomotiveStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  clearLocomotivesByService, 
  clearSuccessMessage, 
  resetDeleteStatus 
} = locomotivesSlice.actions;
export default locomotivesSlice.reducer;