// redux/slices/filterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Sort = {
  name: string;
  sortProperty: string;
};

interface FilterSliceState {
  sort: Sort;
  currentPage: number;
  sell: number; // 0 - все, 1 - в наличии, 2 - отсутствуют
}

const initialState: FilterSliceState = {
  sort: {
    name: 'сначала взрослые',
    sortProperty: 'age',
  },
  currentPage: 1,
  sell: 0, // По умолчанию "Все по дефолту"
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSortType(state, action: PayloadAction<Sort>) {
      state.sort = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setSellType(state, action: PayloadAction<number>) {
      state.sell = action.payload;
      state.currentPage = 1; // Сбрасываем страницу при изменении фильтра
    },
    setFilters(state, action: PayloadAction<FilterSliceState>) {
      state.sort = action.payload.sort;
      state.currentPage = Number(action.payload.currentPage);
      state.sell = Number(action.payload.sell);
    },
  },
});

export const { setSortType, setCurrentPage, setSellType, setFilters } = filterSlice.actions;
export default filterSlice.reducer;