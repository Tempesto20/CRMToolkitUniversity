import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchBrigadas = createAsyncThunk(
  'brigada/fetchBrigadasStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/brigada');
    return data;
  }
);

export const createBrigada = createAsyncThunk(
  'brigada/createBrigadaStatus',
  async (brigadaName: string) => {
    const { data } = await axios.post('http://localhost:3000/brigada', {
      brigadaName
    });
    return data;
  }
);

export const deleteBrigada = createAsyncThunk(
  'brigada/deleteBrigadaStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/brigada/${id}`);
    return id;
  }
);

interface BrigadaState {
  brigadas: any[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: BrigadaState = {
  brigadas: [],
  status: 'idle',
  error: null,
};

const brigadaSlice = createSlice({
  name: 'brigada',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrigadas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBrigadas.fulfilled, (state, action) => {
        state.brigadas = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchBrigadas.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(createBrigada.fulfilled, (state, action) => {
        state.brigadas.push(action.payload);
      })
      .addCase(deleteBrigada.fulfilled, (state, action) => {
        state.brigadas = state.brigadas.filter(b => b.brigadaId !== action.payload);
      });
  },
});

export default brigadaSlice.reducer;