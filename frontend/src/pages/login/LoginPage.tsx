import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/auth/authAction";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await dispatch(loginUser({ email, password }));
    if (success) navigate("/profile");
  };

  return (
    <section>
      <h1>TUDENGIBAAR</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <h2>Login!</h2>
          <p>Please enter your credentials below to continue</p>
        </div>

        <div>
          <label htmlFor="email">Username</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <div>
          <button type="button" onClick={() => navigate("/register")}>
            Register
          </button>
          <a href="#">Forgot Password?</a>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        {error && <p>{error}</p>}
      </form>
    </section>
  );
}
