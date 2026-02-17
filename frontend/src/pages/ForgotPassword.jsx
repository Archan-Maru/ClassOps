import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "If this email exists, reset link sent");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your account email and we’ll send a secure reset link."
      footer={
        <p>
          Remembered it?{" "}
          <Link className="link-inline" to="/login">
            Back to login
          </Link>
        </p>
      }
    >
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
