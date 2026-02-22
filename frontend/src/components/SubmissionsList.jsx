import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import api from "../api/api";

function SubmissionsList({ assignmentId, submissions, onSubmissionsUpdate }) {
  const [sortBy, setSortBy] = useState("latest");
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradingData, setGradingData] = useState({ score: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);

  // Sort submissions based on selected option
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const dateA = new Date(a.submitted_at || "1970-01-01");
      const dateB = new Date(b.submitted_at || "1970-01-01");
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [submissions, sortBy]);

  const handleGradeSubmission = async (submissionId) => {
    if (!gradingData.score && !gradingData.feedback) {
      alert("Please enter at least a score or feedback");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/evaluations/${submissionId}/evaluations`, {
        score: gradingData.score ? parseInt(gradingData.score) : null,
        feedback: gradingData.feedback || null,
      });
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

  const getSubmissionStatus = (submission) => {
    if (submission.submitted_at) {
      return submission.evaluation_id ? "graded" : "submitted";
    }
    return "not-submitted";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="text-lg font-semibold text-slate-100">All Submissions</h3>
        <div className="flex gap-3">
          <label className="text-sm font-medium text-slate-300">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1 text-sm text-slate-100"
          >
            <option value="latest">Latest First</option>
            <option value="earliest">Earliest First</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSubmissions.length === 0 ? (
          <p className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-slate-400">
            No submissions yet
          </p>
        ) : (
          sortedSubmissions.map((submission) => {
            const status = getSubmissionStatus(submission);
            const isExpanded = expandedSubmission === submission.id;
            const isGrading = gradingSubmissionId === submission.id;

            return (
              <div
                key={submission.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{submission.username}</p>
                      {submission.submitted_at && (
                        <p className="text-xs text-slate-400">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "graded" && (
                        <div className="flex items-center gap-1 rounded-lg bg-green-900/20 px-2 py-1">
                          <div className="h-2 w-2 rounded-full bg-green-400"></div>
                          <span className="text-xs font-medium text-green-300">Graded</span>
                        </div>
                      )}
                      {status === "submitted" && !isExpanded && (
                        <div className="flex items-center gap-1 rounded-lg bg-blue-900/20 px-2 py-1">
                          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                          <span className="text-xs font-medium text-blue-300">Submitted</span>
                        </div>
                      )}
                      {status === "not-submitted" && (
                        <div className="flex items-center gap-1 rounded-lg bg-red-900/20 px-2 py-1">
                          <div className="h-2 w-2 rounded-full bg-red-400"></div>
                          <span className="text-xs font-medium text-red-300">Missing</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                    className="ml-4 px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    {isExpanded ? "Hide" : "View"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
                    {submission.submitted_at && (
                      <div>
                        <p className="text-sm font-medium text-slate-300">Submission Content</p>
                        <div className="mt-2 rounded-lg bg-slate-900/40 p-3">
                          {submission.content_url ? (
                            (() => {
                              const url = submission.content_url;
                              const filename = url.split("/").pop().split("?")[0];
                              return (
                                <div className="flex items-center justify-between gap-4">
                                  <a
                                    className="text-indigo-300 underline inline-flex items-center gap-2"
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
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
                                  </a>
                                  <div className="text-sm text-slate-400">Submitted by: <span className="text-slate-200">{submission.username}</span></div>
                                </div>
                              );
                            })()
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-slate-300">{submission.content_text || "No content"}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {submission.evaluation_id && (
                      <div className="rounded-lg bg-green-900/10 p-3">
                        <p className="text-sm font-medium text-green-300">Grade: {submission.score}</p>
                        {submission.feedback && (
                          <p className="mt-1 text-sm text-green-200">{submission.feedback}</p>
                        )}
                      </div>
                    )}

                    {isGrading ? (
                      <div className="space-y-3 rounded-lg bg-indigo-900/10 p-3">
                        <input
                          type="number"
                          placeholder="Score (e.g., 85)"
                          value={gradingData.score}
                          onChange={(e) =>
                            setGradingData({ ...gradingData, score: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
                        />
                        <textarea
                          placeholder="Feedback"
                          value={gradingData.feedback}
                          onChange={(e) =>
                            setGradingData({ ...gradingData, feedback: e.target.value })
                          }
                          rows="3"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleGradeSubmission(submission.id)}
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-green-700 disabled:opacity-50"
                          >
                            {submitting ? "Saving..." : "Save Grade"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGradingSubmissionId(null);
                              setGradingData({ score: "", feedback: "" });
                            }}
                            className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:border-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : submission.submitted_at ? (
                      <button
                        type="button"
                        onClick={() => {
                          setGradingSubmissionId(submission.id);
                          setGradingData({
                            score: submission.score?.toString() || "",
                            feedback: submission.feedback || "",
                          });
                        }}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-indigo-700"
                      >
                        {submission.evaluation_id ? "Edit Grade" : "Grade Submission"}
                      </button>
                    ) : null}
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
