import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type SearchCatsParams = {
  id: string | undefined;
};

export const axiosFullCat = createAsyncThunk(
  'fullCatSlice/axiosFullCatStatus',
  async (params: SearchCatsParams) => {
    const { id } = params;
    const { data } = await axios.get(`http://localhost:3000/cats/${id}`);
    console.log(data);
    return data as FullCatsItems;
  },
);

export type FullCatsItems = {
  age: number;
  breed: string;
  buy: string;
  description: string;
  discount: number;
  id: number; // Измените string на number
  img: string;
  isfavorite: boolean;
  issell: number;
  name: string;
  price: number;
};

interface CatsSliceState {
  item: FullCatsItems | null;
  status: 'loading' | 'success' | 'error';
}

const initialState: CatsSliceState = {
  item: null,
  status: 'loading',
};

const fullCatSlice = createSlice({
  name: 'fullCatSlice',
  initialState,
  reducers: {
    setCat(state, action) {
      state.item = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(axiosFullCat.pending, (state) => {
      state.status = 'loading';
      state.item = null;
    });
    builder.addCase(axiosFullCat.fulfilled, (state, action) => {
      state.item = action.payload;
      state.status = 'success';
    });
    builder.addCase(axiosFullCat.rejected, (state) => {
      state.status = 'error';
      state.item = null;
    });
  },
});

export const { setCat } = fullCatSlice.actions;
export default fullCatSlice.reducer;