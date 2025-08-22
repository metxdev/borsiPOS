import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/product/productAction";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface OrderItemPayload {
  quantity: number;
  product: {
    id: number;
  }
}

/**
 * Simple order placement
 */
export const placeOrder = createAsyncThunk<
  any,
  { items: OrderItemPayload[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  "order/place",
  async ({ items }, { rejectWithValue }) => {
    try {
      const res = await API.post("/orders", { items });
      return res.data;
    } catch (err: any) {
      console.error("placeOrder error response:", err.response?.data || err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Order failed";
      return rejectWithValue(message);
    }
  }
);

/**
 * Higher-level order + refresh + cleanup
 */
export const placeOrderWithRefresh = createAsyncThunk<
  any,
  { cartItems: { productId: number; quantity: number }[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  "order/placeWithRefresh",
  async ({ cartItems }, { dispatch, rejectWithValue }) => {
    try {
      // Build API payload from cart
      const itemsPayload: OrderItemPayload[] = cartItems.map((c) => ({
        quantity: c.quantity,
        product: { id: c.productId },
      }));

      // Place the order
      const res = await dispatch(placeOrder({ items: itemsPayload })).unwrap();

      // Refresh product list after order
      await dispatch(fetchProducts());

      return res;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);
