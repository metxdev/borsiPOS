import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductItem } from "./productSlice";

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

type CreateProductPayload = {
  name: string;
  description: string;
  price: number;
  categoryId: number;
};

type UpdateProductPayload = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
};

export const fetchProducts = createAsyncThunk<ProductItem[], void, { rejectValue: string }>(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get<ProductItem[]>("/products/my");
      return res.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.statusText ||
        "Failed to fetch products";
      return rejectWithValue(message);
    }
  }
);

export const createProduct = createAsyncThunk<ProductItem, CreateProductPayload, { rejectValue: string }>(
  "product/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post<ProductItem>("/products", payload);
      return res.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        (err.response?.status === 409
          ? "Product already exists in that category"
          : "Failed to create product");
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk<ProductItem, UpdateProductPayload, { rejectValue: string }>(
  "product/update",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.put<ProductItem>(`/products/${payload.id}`, payload);
      return res.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        (err.response?.status === 409
          ? "Another product with that name and category already exists"
          : "Failed to update product");
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk<number, number, { rejectValue: string }>(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/products/${id}`);
      return id;
    } catch (err: any) {
      const message =
        err.response?.data?.error || "Failed to delete product";
      return rejectWithValue(message);
    }
  }
);
