import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api/api";

function SubmissionsList({ assignmentId, submissions, onSubmissionsUpdate }) {
  const [sortBy, setSortBy] = useState("latest");
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradingData, setGradingData] = useState({ score: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [usernamesById, setUsernamesById] = useState({});

  const navigate = useNavigate();

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const dateA = new Date(a.submitted_at || "1970-01-01");
      const dateB = new Date(b.submitted_at || "1970-01-01");
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [submissions, sortBy]);

  useEffect(() => {
    const missingIds = Array.from(
      new Set(
        submissions
          .filter((s) => !s.username && s.user_id)
          .map((s) => s.user_id),
      ),
    ).filter((id) => !usernamesById[id]);

    if (missingIds.length === 0) return;

    const fetchNames = async () => {
      const newMap = {};
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const res = await api.get(`/submissions/user/${id}`);
            if (res.data?.user?.username) {
              newMap[id] = res.data.user.username;
            }
          } catch (err) {
            console.error(
              `Failed to fetch username for user ${id}:`,
              err?.message || err,
            );
          }
        }),
      );

      if (Object.keys(newMap).length > 0) {
        setUsernamesById((prev) => ({ ...prev, ...newMap }));
      }
    };

    fetchNames();
  }, [submissions, usernamesById]);

  const handleGradeSubmission = async (submission) => {
    if (!gradingData.score && !gradingData.feedback) {
      alert("Please enter at least a score or feedback");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        score: gradingData.score ? parseInt(gradingData.score) : null,
        feedback: gradingData.feedback || null,
      };

      if (submission.evaluation_id) {
        await api.put(`/evaluations/${submission.evaluation_id}`, payload);
      } else {
        await api.post(`/evaluations/${submission.id}/evaluations`, payload);
      }

      setGradingSubmissionId(null);
      setGradingData({ score: "", feedback: "" });
      onSubmissionsUpdate();
    } catch (err) {
      console.error("Error grading submission:", err);
      alert(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 px-6 py-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          All Submissions
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Sort by
            </label>
            <div className="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 p-0.5">
              <button
                type="button"
                onClick={() => setSortBy("latest")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  sortBy === "latest"
                    ? "bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("earliest")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  sortBy === "earliest"
                    ? "bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Earliest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
        {sortedSubmissions.length === 0 ? (
          <p className="px-6 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            No submissions yet
          </p>
        ) : (
          sortedSubmissions.map((submission) => {
            const isGrading = gradingSubmissionId === submission.id;
            const displayName =
              submission.username ||
              submission.group_name ||
              usernamesById[submission.user_id] ||
              submission.user_id ||
              "Unknown";
            const filename = submission.content_url
              ? submission.content_url.split("/").pop().split("?")[0]
              : null;

            return (
              <div
                key={submission.id}
                className="group px-6 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                {/* 3-column row: name+time | file | action */}
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                  {/* Col 1: student name + submitted time */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {displayName}
                    </p>
                    {submission.submitted_at ? (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        Not submitted
                      </p>
                    )}
                  </div>

                  {/* Col 2: file name */}
                  <div className="hidden sm:flex min-w-0 max-w-55 items-center gap-1.5">
                    {filename ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {filename}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        No file
                      </span>
                    )}
                  </div>

                  {/* Col 3: grade badge + action button */}
                  <div className="flex shrink-0 items-center gap-2">
                    {submission.evaluation_id && (
                      <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-100 dark:ring-green-800">
                        {submission.score ?? "Graded"}
                      </span>
                    )}
                    {filename && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/documents/submission-${submission.id}`)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                          <path
                            fillRule="evenodd"
                            d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View
                      </button>
                    )}
                    {submission.submitted_at && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isGrading) {
                            setGradingSubmissionId(null);
                            setGradingData({ score: "", feedback: "" });
                          } else {
                            setGradingSubmissionId(submission.id);
                            setGradingData({
                              score: submission.score?.toString() || "",
                              feedback: submission.feedback || "",
                            });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                        {isGrading
                          ? "Cancel"
                          : submission.evaluation_id
                            ? "Edit Grade"
                            : "Grade"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback display */}
                {submission.evaluation_id &&
                  submission.feedback &&
                  !isGrading && (
                    <div className="mt-2 ml-0 rounded-lg bg-zinc-50 dark:bg-zinc-900 px-3 py-2">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Feedback:{" "}
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {submission.feedback}
                        </span>
                      </p>
                    </div>
                  )}

                {/* Grading form (inline, expands below the row) */}
                {isGrading && (
                  <div className="mt-3 space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Score (e.g. 85)"
                        value={gradingData.score}
                        onChange={(e) =>
                          setGradingData({
                            ...gradingData,
                            score: e.target.value,
                          })
                        }
                        className="rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleGradeSubmission(submission)}
                          disabled={submitting}
                          className="flex-1 rounded-lg bg-violet-600 dark:bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? "Savingâ€¦" : "Save Grade"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGradingSubmissionId(null);
                            setGradingData({ score: "", feedback: "" });
                          }}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <textarea
                      placeholder="Feedback (optional)"
                      value={gradingData.feedback}
                      onChange={(e) =>
                        setGradingData({
                          ...gradingData,
                          feedback: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

SubmissionsList.propTypes = {
  assignmentId: PropTypes.number.isRequired,
  submissions: PropTypes.array.isRequired,
  onSubmissionsUpdate: PropTypes.func.isRequired,
};

export default SubmissionsList;
