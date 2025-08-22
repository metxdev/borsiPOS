export interface User {
  id: number;
  fullName: string;
  email: string;
  token?: string; // optional since backend sends separately
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rehydrated: boolean;
}

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");


export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rehydrated: boolean;
}

export const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedUser && !!storedToken,
  loading: false,
  error: null,
  rehydrated: false,
};
