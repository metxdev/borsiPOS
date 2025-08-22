import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authStart, authSuccess, authFailure, logout } from "./authSlice";
import type { LoginPayload, RegisterPayload, AuthResponse } from "../../models/auth";
import type { User } from "../../models/user";
import type { AppDispatch } from "../store";

const API_URL = "http://localhost:8080";

export const loginUser = (credentials: LoginPayload) => async (dispatch: AppDispatch) => {
  dispatch(authStart());
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    const userWithToken: User = { ...user, token };
    dispatch(authSuccess(userWithToken));
    return true;
  } catch (error: any) {
    dispatch(authFailure(error.response?.data?.message || "Login failed"));
    return false;
  }
};

export const registerUser = createAsyncThunk<User, RegisterPayload>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>("http://localhost:8080/auth/signup", payload, {
        headers: { "Content-Type": "application/json" },
      });
      const { user, token } = res.data;
      return { ...user, token };
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        (typeof err.message === "string" ? err.message : "Registration failed");
      return rejectWithValue(msg);
    }
  }
);

export const updateUserById = createAsyncThunk<
  User,
  { id: number; fullName: string; email: string; password?: string },
  { rejectValue: string }
>(
  "auth/updateUserById",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated: User = res.data;
      if (!updated.token && token) {
        updated.token = token;
      }
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);
