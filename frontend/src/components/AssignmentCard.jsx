import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function AssignmentCard({ id, classId, title, submissionType, deadline, status, isTeacher, onDelete }) {
  const statusColor = status === "Submitted" ? "text-green-400" : "text-yellow-400";
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <div className="relative rounded-xl border border-slate-700 bg-slate-800/80 shadow-sm shadow-slate-950/20 hover:bg-slate-800 transition-colors">
      <Link
        to={`/classes/${classId}/assignments/${id}`}
        className="block p-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            <div className="mt-2 flex gap-3">
              <span className="inline-block rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
                {submissionType}
              </span>
              {status && (
                <span className={`inline-block text-xs font-medium ${statusColor}`}>{status}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-400">Due: {formatDate(deadline)}</p>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-indigo-400">View Assignment →</div>
      </Link>

      {isTeacher && onDelete && (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete assignment"
              className="group rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

AssignmentCard.propTypes = {
  id: PropTypes.number.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  submissionType: PropTypes.oneOf(["INDIVIDUAL", "GROUP"]).isRequired,
  deadline: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["Pending", "Submitted"]),
  isTeacher: PropTypes.bool,
  onDelete: PropTypes.func,
};

AssignmentCard.defaultProps = {
  status: "",
  isTeacher: false,
  onDelete: null,
};

export default AssignmentCard;
