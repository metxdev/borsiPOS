import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./components/Layout";
import SalesPage from "./pages/sales/SalesPage";
import RevenuePage from "./pages/revenue/RevenuePage";

import { useAppSelector } from "./store/hooks";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";

import { User } from "./models/user";
import { authSuccess, logout, setRehydrated } from "./store/auth/authSlice";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { JSX } from "react/jsx-runtime";
import PricesPage from "./pages/prices/PricesPage";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, rehydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser) as User;
      user.token = storedToken;

      dispatch(authSuccess(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    dispatch(setRehydrated());
  }, [dispatch]);

  // ✅ Axios interceptor to auto-logout and redirect on 401/403
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if ([401, 403].includes(error?.response?.status)) {
          dispatch(logout());
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login"; // force redirect
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  if (!rehydrated) return null;

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <SalesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <PrivateRoute>
              <Layout>
                <RevenuePage />
              </Layout>
            </PrivateRoute>
          }
        />
                <Route
          path="/prices"
          element={
            <PrivateRoute>
                <PricesPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<h1 className="text-white p-4">Page not found</h1>} />
      </Routes>
    </Router>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user, rehydrated } = useAppSelector((state) => state.auth);

  if (!rehydrated) return null;

  const hasAccess = isAuthenticated && user !== null;

  return hasAccess ? children : <Navigate to="/login" replace />;
}
