import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groupReducer from './slices/groupSlice';
import listReducer from './slices/listSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupReducer,
    lists: listReducer,
    ui: uiReducer,
  },
});

export default store;
