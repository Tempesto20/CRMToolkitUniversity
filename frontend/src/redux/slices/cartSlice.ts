import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CartItemSlice = {
  id: number; // Измените на number
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

interface CartSliceState {
  totalPrice: number;
  items: CartItemSlice[];
}

const initialState: CartSliceState = {
  totalPrice: 0,
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setAddItem(state, action: PayloadAction<CartItemSlice>) {
      const findItem = state.items.find((object) => object.id === action.payload.id);
      
      if (findItem) {
        findItem.count++;
      } else {
        state.items.push({
          ...action.payload,
          count: 1,
        });
      }
      
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price * obj.count + sum;
      }, 0);
    },

    setRemoveItem(state, action: PayloadAction<number>) { // Измените на number
      state.items = state.items.filter((object) => object.id !== action.payload);
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price * obj.count + sum;
      }, 0);
    },

    setClearItems(state) {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { setAddItem, setRemoveItem, setClearItems } = cartSlice.actions;
export default cartSlice.reducer;