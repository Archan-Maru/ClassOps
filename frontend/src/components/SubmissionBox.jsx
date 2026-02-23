import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api/api";

function SubmissionBox({
  assignmentId,
  hasSubmission,
  initialContent,
  onSubmissionSuccess,
  submissionId,
}) {
  const [submission, setSubmission] = useState(initialContent || "");
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
  }, [hasSubmission, initialContent]);

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

  if (!isEditing && localHasSubmission) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Your Submission
        </h3>
        <div className="mt-4 rounded-lg border border-slate-600 bg-slate-900/40 p-4">
          <p className="text-slate-300">{submission}</p>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-indigo-700"
          >
            Edit Submission
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex-1 rounded-lg border border-red-600 bg-red-900/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 disabled:opacity-50"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="text-lg font-semibold text-slate-100">Submit Your Work</h3>

      <div className="mt-4">
        <label className="block text-sm text-slate-300">Add file</label>

        {/* Hidden native file input triggered by the dashed dropzone */}
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
          className="mt-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/40 px-4 py-3 text-slate-100 hover:border-indigo-500 flex items-center justify-between"
        >
          <span className="text-sm text-slate-300">
            Click to attach a file or drag it here
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="rounded bg-green-600 px-3 py-1 text-white text-sm"
          >
            Attach
          </button>
        </div>

        {file && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-100">
            <span className="truncate max-w-xs">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
        {submission && (
          <div className="mt-3 text-sm text-slate-300">
            Current:
            <div className="mt-1">
              {(() => {
                const url = submission;
                const filename = url.split("/").pop().split("?")[0];
                return (
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      className="text-indigo-300 underline inline-flex items-center gap-2"
                      to={`/documents/submission-${submissionId}`}
                      aria-label={`Open file ${filename}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4 text-indigo-300"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="truncate">{filename}</span>
                    </Link>
                    <div className="text-sm text-slate-400">
                      Submitted by:{" "}
                      <span className="text-slate-200">
                        {localHasSubmission ? "You" : "Student"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="mt-4 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-slate-100 disabled:opacity-50 hover:bg-green-700"
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

SubmissionBox.propTypes = {
  assignmentId: PropTypes.number.isRequired,
  hasSubmission: PropTypes.bool,
  initialContent: PropTypes.string,
  onSubmissionSuccess: PropTypes.func,
  submissionId: PropTypes.number,
};

SubmissionBox.defaultProps = {
  hasSubmission: false,
  initialContent: "",
  onSubmissionSuccess: null,
  submissionId: null,
};

export default SubmissionBox;
