import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        email,
        newPassword,
      });

      setMessage(res.data.message || "Password reset successful");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="The link may have expired or already been used."
        footer={null}
      >
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          Please request a new password reset link and try again.
        </Alert>
        <Button
          component={Link}
          to="/forgot-password"
          variant="contained"
          fullWidth
          sx={{ py: 1.25 }}
        >
          Request new link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Resetting account for ${email}`}
      footer={null}
    >
      {message && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          {message}
        </Alert>
      )}
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
          id="new-password"
          type="password"
          label="New password"
          placeholder="Enter a strong password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          slotProps={{ htmlInput: { minLength: 8 } }}
          required
          fullWidth
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ py: 1.25 }}
        >
          {loading ? "Updating password..." : "Reset password"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

export default ResetPassword;
