import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './slices/employeesSlice';
import locomotivesReducer from './slices/locomotivesSlice';
import locationWorkReducer from './slices/locationWorkSlice';
import leavesReducer from './slices/leavesSlice';
import dispatchPlanReducer from './slices/dispatchPlanSlice';

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    locomotives: locomotivesReducer,
    locationWork: locationWorkReducer,
    leaves: leavesReducer,
    dispatchPlan: dispatchPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from '../redux/store';
