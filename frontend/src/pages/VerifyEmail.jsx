import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
      navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login");
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
        <div className="alert alert--warning">
          No email detected in the verification flow. Please start again by
          completing the signup form.
        </div>
        <Link className="primary-btn" to="/signup">
          Go to signup
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}`}
      footer={
        <p>
          Didn’t receive anything?{" "}
          <Link className="link-inline" to="/signup">
            Try signing up again
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert--error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">One-time passcode</label>
          <input
            id="otp"
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input"
            inputMode="numeric"
            maxLength={6}
            required
          />
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default VerifyEmail;
