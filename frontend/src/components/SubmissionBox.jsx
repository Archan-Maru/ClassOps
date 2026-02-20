import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../api/api";

function SubmissionBox({ assignmentId, hasSubmission, initialContent, onSubmissionSuccess, submissionId }) {
  const [submission, setSubmission] = useState(initialContent || "");
  const [isEditing, setIsEditing] = useState(!hasSubmission);
  const [submissionType, setSubmissionType] = useState("text");
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
    if (!submission.trim()) {
      setError("Please enter submission content");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const payload = submissionType === "url" 
        ? { content_url: submission }
        : { content_text: submission };
      
      if (submissionId) {
        await api.put(`/submissions/${submissionId}`, payload);
      } else {
        await api.post(`/assignments/${assignmentId}/submissions`, payload);
      }

      setLocalHasSubmission(true);
      setIsEditing(false);
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err) {
      
      if (err.response?.status === 409 && !submissionId) {
        try {
          const submissionRes = await api.get(`/submissions/${assignmentId}/submission`);
          if (submissionRes.data?.exists && submissionRes.data?.id) {
            const payload = submissionType === "url" 
              ? { content_url: submission }
              : { content_text: submission };
            await api.put(`/submissions/${submissionRes.data.id}`, payload);
            setLocalHasSubmission(true);
            setIsEditing(false);
            if (onSubmissionSuccess) {
              onSubmissionSuccess();
            }
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
        <h3 className="text-lg font-semibold text-slate-100">Your Submission</h3>
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

      <div className="mt-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="text"
            checked={submissionType === "text"}
            onChange={(e) => setSubmissionType(e.target.value)}
            className="h-4 w-4"
          />
          <span className="text-slate-300">Text</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="url"
            checked={submissionType === "url"}
            onChange={(e) => setSubmissionType(e.target.value)}
            className="h-4 w-4"
          />
          <span className="text-slate-300">URL</span>
        </label>
      </div>

      {submissionType === "text" && (
        <textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          placeholder="Enter your submission here..."
          className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500"
          rows="6"
        />
      )}

      {submissionType === "url" && (
        <input
          type="url"
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          placeholder="https://..."
          className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500"
        />
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!submission.trim() || isLoading}
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
};;

export default SubmissionBox;
