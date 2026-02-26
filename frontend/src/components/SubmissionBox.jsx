import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api/api";

function SubmissionBox({
  assignmentId,
  hasSubmission,
  initialContent,
  originalFilename,
  onSubmissionSuccess,
  submissionId,
}) {
  const [submission, setSubmission] = useState(initialContent || "");
  const [fileName, setFileName] = useState(originalFilename || "");
  const [isEditing, setIsEditing] = useState(!hasSubmission);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);
  const [localHasSubmission, setLocalHasSubmission] = useState(hasSubmission);

  useEffect(() => {
    setLocalHasSubmission(hasSubmission);
    if (hasSubmission && initialContent) {
      setSubmission(initialContent);
      setIsEditing(false);
    }
    if (originalFilename) {
      setFileName(originalFilename);
    }
  }, [hasSubmission, initialContent, originalFilename]);

  useEffect(() => {
    if (error && error.includes("already submitted")) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please choose a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      setError(null);

      if (submissionId) {
        await api.put(`/submissions/${submissionId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/assignments/${assignmentId}/submissions`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setLocalHasSubmission(true);
      setIsEditing(false);
      if (onSubmissionSuccess) onSubmissionSuccess();
    } catch (err) {
      // handle duplicate submission: fetch existing and try updating
      if (err.response?.status === 409 && !submissionId) {
        try {
          const submissionRes = await api.get(
            `/submissions/${assignmentId}/submission`,
          );
          const existingId = submissionRes.data?.id;
          if (existingId) {
            await api.put(`/submissions/${existingId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            setLocalHasSubmission(true);
            setIsEditing(false);
            if (onSubmissionSuccess) onSubmissionSuccess();
            return;
          }
        } catch (fetchErr) {
          console.error("Could not handle 409:", fetchErr);
        }
      }

      setError(err.response?.data?.message || "Failed to submit");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRemove = async () => {
    if (!submissionId) {
      console.error("No submission ID available for deletion");
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);
      await api.delete(`/submissions/${submissionId}`);
      setSubmission("");
      setLocalHasSubmission(false);
      setIsEditing(true);
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove submission");
      console.error("Remove error:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const displayName =
    fileName ||
    (submission ? submission.split("/").pop().split("?")[0] : "Submission");

  if (!isEditing && localHasSubmission) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Your Submission
        </h3>
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 shrink-0 text-violet-400 dark:text-violet-500"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span
              className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300"
              title={displayName}
            >
              {displayName}
            </span>
          </div>
          {submissionId && (
            <Link
              to={`/documents/submission-${submissionId}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path
                  fillRule="evenodd"
                  d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              View Submission
            </Link>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 rounded-lg bg-violet-600 dark:bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
          >
            Edit Submission
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
          >
            {isRemoving ? "Removingâ€¦" : "Remove"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Submit Your Work
      </h3>

      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Attach file
        </label>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer?.files?.[0];
            if (f) setFile(f);
          }}
          className="mt-2 flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
        >
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Click to attach a file or drag it here
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-1 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-zinc-600 transition-colors"
          >
            Browse
          </button>
        </div>

        {file && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm">
            <span className="max-w-xs truncate text-zinc-700 dark:text-zinc-300">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-auto rounded px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {submission && (
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Current file:
            <div className="mt-1">
              {(() => {
                const url = submission;
                const filename = url.split("/").pop().split("?")[0];
                return (
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                      to={`/documents/submission-${submissionId}`}
                      aria-label={`Open file ${filename}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="truncate">{filename}</span>
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="mt-4 w-full rounded-lg bg-violet-600 dark:bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Submittingâ€¦" : "Submit"}
      </button>
    </div>
  );
}

SubmissionBox.propTypes = {
  assignmentId: PropTypes.number.isRequired,
  hasSubmission: PropTypes.bool,
  initialContent: PropTypes.string,
  originalFilename: PropTypes.string,
  onSubmissionSuccess: PropTypes.func,
  submissionId: PropTypes.number,
};

SubmissionBox.defaultProps = {
  hasSubmission: false,
  initialContent: "",
  originalFilename: "",
  onSubmissionSuccess: null,
  submissionId: null,
};

export default SubmissionBox;
