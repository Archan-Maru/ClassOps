import { useState } from "react";
import api from "../api/api";

function JoinClassModal({ isOpen, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Class code is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/classes/join-by-code", {
        code: code.trim().toUpperCase(),
      });
      setCode("");
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join class");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100">Join a Class</h2>
        <p className="mt-1 text-sm text-zinc-400">Enter the class code provided by your teacher</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-zinc-400">
              Class Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength="10"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-center text-lg font-mono text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinClassModal;
