import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

const token = localStorage.getItem("token");

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

export const fetchCategories = createAsyncThunk(
  "category/fetch",
  async (_, { getState, rejectWithValue }) => {
    const { category } = getState() as RootState;

    if (category.categories.length > 0) {
      return category.categories;
    }

    try {
      const res = await API.get("/categories");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Unknown error");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload: { name: string }, thunkAPI) => {
    try {
      const res = await API.post("/categories", payload);
      thunkAPI.dispatch(fetchCategories()); // Optional: refresh after create
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Create failed");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (
    { id, name }: { id: number; name: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await API.put(`/categories/${id}`, { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id: number, { rejectWithValue }) => {
    try {
      await API.delete(`/categories/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);
