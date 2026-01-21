import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const axiosCats = createAsyncThunk('asyncThunkSlice/axiosCatsStatus', async () => {
  const { data } = await axios.get(`http://localhost:3000/cats/fullCat`);
  console.log(data);
  return data as CatsItems[];
});

export type CatsItems = {
  id: number; // Измените string на number
  img: string;
  name: string;
  buy: string;
  breed: string;
  description: string;
  discount: number;
  price: number;
  age: number;
  issell: number;
  isfavorite: boolean;
};

interface CatsSliceState {
  items: CatsItems[];
  status: 'loading' | 'success' | 'error';
}

const initialState: CatsSliceState = {
  items: [],
  status: 'loading',
};

const asyncThunkSlice = createSlice({
  name: 'asyncThunkSlice',
  initialState,
  reducers: {
    setCats(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(axiosCats.pending, (state) => {
      state.status = 'loading';
      state.items = [];
    });
    builder.addCase(axiosCats.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = 'success';
    });
    builder.addCase(axiosCats.rejected, (state) => {
      state.status = 'error';
      state.items = [];
    });
  },
});

export const {} = asyncThunkSlice.actions;
export default asyncThunkSlice.reducer;