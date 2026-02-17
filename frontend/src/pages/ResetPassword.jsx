import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
        <div className="alert alert--warning">
          Please request a new password reset link and try again.
        </div>
        <Link className="primary-btn" to="/forgot-password">
          Request new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Resetting account for ${email}`}
      footer={null}
    >
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            placeholder="Enter a strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            minLength={8}
            required
          />
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Updating password..." : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
