import { useState } from "react";
import PropTypes from "prop-types";
import api from "../api/api";

function InviteStudentsModal({ isOpen, onClose, classId }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Invalid email format");
      return;
    }

    if (emails.includes(trimmed)) {
      setError("Email already added");
      return;
    }

    setEmails([...emails, trimmed]);
    setEmailInput("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      setError("Add at least one email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/classes/${classId}/invites`, { emails });
      setResults(res.data.results);
      setEmails([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailInput("");
    setEmails([]);
    setResults(null);
    setError("");
    onClose();
  };

  const statusLabel = (status) => {
    switch (status) {
      case "sent":
        return { text: "Sent", color: "text-green-400" };
      case "already_enrolled":
        return { text: "Already enrolled", color: "text-yellow-400" };
      case "already_invited":
        return { text: "Already invited", color: "text-yellow-400" };
      case "email_failed":
        return { text: "Email failed", color: "text-red-400" };
      default:
        return { text: status, color: "text-slate-400" };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-100">Invite Students</h2>
        <p className="mt-1 text-sm text-slate-400">Send email invites to join this class</p>

        {!results ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400">Email Address</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="student@example.com"
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addEmail}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
                >
                  Add
                </button>
              </div>
            </div>

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-200"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="text-indigo-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || emails.length === 0}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : `Send ${emails.length > 0 ? `(${emails.length})` : ""}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {results.map((r, i) => {
              const label = statusLabel(r.status);
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
                  <span className="text-sm text-slate-200">{r.email}</span>
                  <span className={`text-xs font-medium ${label.color}`}>{label.text}</span>
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

InviteStudentsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default InviteStudentsModal;
