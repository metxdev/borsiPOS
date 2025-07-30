import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import { useAppSelector } from "./store/hooks";
import ProfilePage from "./pages/profile/ProfilePage";
import { JSX } from "react/jsx-runtime";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authSuccess } from "./store/auth/authSlice";
import axios from "axios";
import { User } from "./models/user";

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser) as User;
      user.token = storedToken;

      dispatch(authSuccess(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/profile" /> : <RegisterPage />} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<h1 className="text-white p-4">Page not found</h1>} />
      </Routes>
    </Router>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}
