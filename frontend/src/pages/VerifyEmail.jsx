import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const redirect = location.state?.redirect;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/verify-email", { email, otp });
      navigate(
        redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout
        title="Verification needed"
        subtitle="We need your email to verify the OTP."
        footer={null}
      >
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          No email detected in the verification flow. Please start again by
          completing the signup form.
        </Alert>
        <Button
          component={Link}
          to="/signup"
          variant="contained"
          fullWidth
          sx={{ py: 1.25 }}
        >
          Go to signup
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}`}
      footer={
        <Typography variant="body2">
          Didn't receive anything?{" "}
          <Link
            to="/signup"
            style={{
              color: "inherit",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Try signing up again
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
          id="otp"
          label="One-time passcode"
          placeholder="------"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
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
          {loading ? "Verifying..." : "Verify email"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

export default VerifyEmail;
