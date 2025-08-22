import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../../models/auth";
import { initialState } from "../../models/auth";
import { registerUser, updateUserById } from "./authAction";

const authSlice = createSlice({
  name: "auth",
  initialState, // no "as AuthState" needed if initialState is already typed
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem("user", JSON.stringify(action.payload));
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    authFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setRehydrated(state) {
      state.rehydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.error = (action.payload as string) || "Registration failed";
      state.loading = false;
    });
    builder.addCase(updateUserById.fulfilled, (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    });
    builder.addCase(updateUserById.rejected, (state, action) => {
      state.error = (action.payload as string) || "Update failed";
    });
  },
});

export const { authStart, authSuccess, authFailure, logout, setRehydrated } = authSlice.actions;
export default authSlice.reducer;
