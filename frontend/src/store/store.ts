import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import categoryReducer from "./category/categorySlice"
import productReducer from "./product/productSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    product: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
