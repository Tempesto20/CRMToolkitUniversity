import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchServiceTypes = createAsyncThunk(
  'serviceTypes/fetchServiceTypesStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/service-types');
    return data as any[];
  }
);

export const createServiceType = createAsyncThunk(
  'serviceTypes/createServiceTypeStatus',
  async (serviceTypeData: { serviceTypeId: number; serviceTypeName: string }) => {
    const { data } = await axios.post('http://localhost:3000/service-types', serviceTypeData);
    return data;
  }
);

export const updateServiceType = createAsyncThunk(
  'serviceTypes/updateServiceTypeStatus',
  async ({ id, serviceTypeName }: { id: number; serviceTypeName: string }) => {
    const { data } = await axios.put(`http://localhost:3000/service-types/${id}`, {
      serviceTypeName
    });
    return data;
  }
);

export const deleteServiceType = createAsyncThunk(
  'serviceTypes/deleteServiceTypeStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/service-types/${id}`);
    return id;
  }
);

interface ServiceTypeState {
  serviceTypes: any[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: ServiceTypeState = {
  serviceTypes: [],
  status: 'idle',
  error: null,
};

const serviceTypesSlice = createSlice({
  name: 'serviceTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceTypes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.serviceTypes = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchServiceTypes.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch service types';
      })
      .addCase(createServiceType.fulfilled, (state, action) => {
        state.serviceTypes.push(action.payload);
      })
      .addCase(updateServiceType.fulfilled, (state, action) => {
        const index = state.serviceTypes.findIndex(
          st => st.serviceTypeId === (action.payload as any).serviceTypeId
        );
        if (index !== -1) {
          state.serviceTypes[index] = action.payload;
        }
      })
      .addCase(deleteServiceType.fulfilled, (state, action) => {
        state.serviceTypes = state.serviceTypes.filter(
          st => st.serviceTypeId !== action.payload
        );
      });
  },
});

export default serviceTypesSlice.reducer;