import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await api.get(`/invite-info/${token}`);
        setInviteInfo(res.data);

        if (res.data.status === "ACCEPTED") {
          setStatus("already_accepted");
          return;
        }

        if (isLoggedIn) {
          setStatus("ready");
        } else {
          setStatus("need_login");
        }
      } catch {
        setStatus("invalid");
      }
    }
    fetchInfo();
  }, [token, isLoggedIn]);

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      const res = await api.post(`/accept-invite/${token}`);
      setStatus("success");
      setTimeout(() => navigate(`/classes/${res.data.classId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invite");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
            <p className="text-zinc-400">Loading invite...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Invalid Invite</h2>
            <p className="text-sm text-zinc-400">This invite link is invalid or has expired.</p>
            <Link to="/dashboard" className="mt-2 text-sm text-violet-400 hover:text-violet-300">
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "already_accepted" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
              <svg className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Already Accepted</h2>
            <p className="text-sm text-zinc-400">This invite has already been used.</p>
            <Link to="/dashboard" className="mt-2 text-sm text-violet-400 hover:text-violet-300">
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "need_login" && inviteInfo && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
              <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Class Invitation</h2>
            <p className="text-sm text-zinc-300">
              <span className="font-medium text-violet-300">{inviteInfo.invitedBy}</span> invited you to join
            </p>
            <p className="text-lg font-semibold text-zinc-100">{inviteInfo.classTitle}</p>
            <p className="text-sm text-zinc-400">Sign in or create an account to accept this invite.</p>
            <div className="mt-2 flex gap-3">
              <Link
                to={`/login?redirect=/invite/${token}`}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
              >
                Sign In
              </Link>
              <Link
                to={`/signup?redirect=/invite/${token}`}
                className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {status === "ready" && inviteInfo && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
              <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Class Invitation</h2>
            <p className="text-sm text-zinc-300">
              <span className="font-medium text-violet-300">{inviteInfo.invitedBy}</span> invited you to join
            </p>
            <p className="text-lg font-semibold text-zinc-100">{inviteInfo.classTitle}</p>
            <button
              onClick={handleAccept}
              className="mt-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
            >
              Accept & Join Class
            </button>
          </div>
        )}

        {status === "accepting" && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
            <p className="text-zinc-400">Joining class...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Joined Successfully!</h2>
            <p className="text-sm text-zinc-400">Redirecting to class...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Failed to Join</h2>
            <p className="text-sm text-red-300">{error}</p>
            <Link to="/dashboard" className="mt-2 text-sm text-violet-400 hover:text-violet-300">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcceptInvite;
