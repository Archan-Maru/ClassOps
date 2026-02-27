import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
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
      footer={
        <Typography variant="body2">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "inherit",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Create one
          </Link>
        </Typography>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <TextField
          id="identifier"
          name="identifier"
          label="Email or username"
          placeholder="you@example.com"
          value={form.identifier}
          onChange={handleChange}
          autoComplete="username"
          required
          fullWidth
          size="small"
        />

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography
              component="label"
              htmlFor="password"
              variant="body2"
              sx={{ fontWeight: 500, color: "text.secondary" }}
            >
              Password
            </Typography>
            <Link
              to="/forgot-password"
              style={{
                fontSize: "0.75rem",
                color: "#7c3aed",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </Box>
          <TextField
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            fullWidth
            size="small"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 0.5, py: 1.25 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

export default Login;
