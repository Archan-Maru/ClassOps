import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function ClassworkCard({
  id,
  title,
  description,
  resourceUrl,
  createdAt,
  isTeacher,
  onDelete,
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
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

  return (
    <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-8">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
          <div className="mt-2 flex gap-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Uploaded {formatDate(createdAt, { includeTime: true })}
            </span>
          </div>
        </div>
      </div>
      {resourceUrl && (
        <Link
          to={`/documents/classwork-${id}`}
          className="mt-4 inline-flex items-center rounded-lg bg-violet-50 dark:bg-violet-900/30 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-100 dark:ring-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
        >
          View Material
        </Link>
      )}

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
                {deleting ? "Deletingâ€¦" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete classwork"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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

ClassworkCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  resourceUrl: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  isTeacher: PropTypes.bool,
  onDelete: PropTypes.func,
};

ClassworkCard.defaultProps = {
  description: "",
  resourceUrl: "",
  isTeacher: false,
  onDelete: null,
};

export default ClassworkCard;
