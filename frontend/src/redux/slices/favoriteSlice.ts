import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FavoriteItemSlice = {
  id: number;
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
  count: number;
};

interface FavoriteSliceState {
  items: FavoriteItemSlice[];
  totalPrice: number; // Добавьте totalPrice
}

const initialState: FavoriteSliceState = {
  items: [],
  totalPrice: 0,
};

export const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    setAddLike(state, action: PayloadAction<FavoriteItemSlice>) {
      state.items.push({
        ...action.payload,
        count: 1,
      });
      state.totalPrice = state.items.reduce((sum, obj) => obj.price * obj.count + sum, 0);
    },

    setRemoveLike(state, action: PayloadAction<number>) {
      state.items = state.items.filter((object) => object.id !== action.payload);
      state.totalPrice = state.items.reduce((sum, obj) => obj.price * obj.count + sum, 0);
    },

    setClearLikes(state) { 
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { setAddLike, setRemoveLike, setClearLikes } = favoriteSlice.actions;
export default favoriteSlice.reducer;