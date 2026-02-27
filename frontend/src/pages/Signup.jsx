import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "STUDENT",
  });
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
      await api.post("/auth/signup", form);
      navigate("/verify-email", { state: { email: form.email, redirect } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your ClassOps account"
      subtitle="Invite students, publish assignments, and keep every submission organized."
      footer={
        <Typography variant="body2">
          Already registered?{" "}
          <Link
            to="/login"
            style={{
              color: "inherit",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Sign in
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
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            fullWidth
            size="small"
          />
          <TextField
            id="username"
            name="username"
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
            fullWidth
            size="small"
          />
        </Box>

        <TextField
          id="password"
          type="password"
          name="password"
          label="Password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
          fullWidth
          size="small"
        />

        <TextField
          id="role"
          name="role"
          select
          label="Role"
          value={form.role}
          onChange={handleChange}
          fullWidth
          size="small"
        >
          <MenuItem value="STUDENT">Student</MenuItem>
          <MenuItem value="TEACHER">Teacher</MenuItem>
        </TextField>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ py: 1.25 }}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

export default Signup;
