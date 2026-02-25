import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function AssignmentCard({
  id,
  classId,
  title,
  submissionType,
  deadline,
  status,
  isTeacher,
  onDelete,
}) {
  const statusColor =
    status === "Submitted"
      ? "text-green-600 bg-green-50"
      : "text-amber-600 bg-amber-50";
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
    <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/classes/${classId}/assignments/${id}`} className="block p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {submissionType}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Due: {formatDate(deadline)}
            </p>
          </div>
          {!isTeacher && status && (
            <span
              className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
            >
              {status}
            </span>
          )}
        </div>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          View Assignment
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete assignment"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
