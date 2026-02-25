import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate(redirect || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your classes, submissions, and groups."
      footer={
        <p>
          Don't have an account?{" "}
          <Link className="link-inline" to="/signup">
            Create one
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert--error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identifier">Email or Username</label>
          <input
            id="identifier"
            name="identifier"
            placeholder="Enter your email or username"
            value={form.identifier}
            onChange={handleChange}
            className="input"
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="input"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-meta">
          <Link className="link-inline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
