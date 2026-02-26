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
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            className="text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300"
            to="/signup"
          >
            Create one
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Email / username */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="identifier"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email or username
          </label>
          <input
            id="identifier"
            name="identifier"
            placeholder="you@example.com"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-xl bg-violet-600 dark:bg-violet-500 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 dark:hover:bg-violet-600 active:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing inâ€¦" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
