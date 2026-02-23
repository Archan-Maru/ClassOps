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

  // Sort submissions based on selected option
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const dateA = new Date(a.submitted_at || "1970-01-01");
      const dateB = new Date(b.submitted_at || "1970-01-01");
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [submissions, sortBy]);

  // When submissions change, fetch missing usernames by user_id
  useEffect(() => {
    const missingIds = Array.from(
      new Set(
        submissions
          .filter((s) => !s.username && s.user_id)
          .map((s) => s.user_id),
      ),
    ).filter((id) => !usernamesById[id]);

    if (missingIds.length === 0) return;

    // Fetch usernames for missing ids
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

  const getSubmissionStatus = (submission) => {
    if (submission.submitted_at) {
      return submission.evaluation_id ? "graded" : "submitted";
    }
    return "not-submitted";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="text-lg font-semibold text-slate-100">
          All Submissions
        </h3>
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
            const isGrading = gradingSubmissionId === submission.id;

            return (
              <div
                key={submission.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">
                        {submission.username ||
                          usernamesById[submission.user_id] ||
                          submission.user_id ||
                          "Unknown"}
                      </p>
                      {submission.submitted_at && (
                        <p className="text-xs text-slate-400">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {submission.submitted_at && (
                    <button
                      type="button"
                      onClick={() => {
                        setGradingSubmissionId(submission.id);
                        setGradingData({
                          score: submission.score?.toString() || "",
                          feedback: submission.feedback || "",
                        });
                      }}
                      className="ml-4 px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      {submission.evaluation_id ? "Edit Grade" : "Grade"}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    {submission.content_url ? (
                      (() => {
                        const url = submission.content_url;
                        const filename = url.split("/").pop().split("?")[0];
                        return (
                          <>
                            <span className="truncate ml-2 text-slate-300">
                              {filename}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/documents/submission-${submission.id}`,
                                )
                              }
                              className="ml-2 text-indigo-400 hover:text-indigo-300 underline"
                            >
                              View
                            </button>
                          </>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">No file attached</span>
                    )}
                  </div>

                  <div className="text-slate-400">
                    Submitted by:{" "}
                    <span className="text-slate-100">
                      {submission.username ||
                        usernamesById[submission.user_id] ||
                        submission.user_id ||
                        "Unknown"}
                    </span>
                  </div>
                </div>

                {submission.evaluation_id && (
                  <div className="mt-3 rounded-lg bg-green-900/10 p-3">
                    <p className="text-sm font-medium text-green-300">
                      Grade: {submission.score}
                    </p>
                    {submission.feedback && (
                      <p className="mt-1 text-sm text-green-200">
                        {submission.feedback}
                      </p>
                    )}
                  </div>
                )}

                {isGrading ? (
                  <div className="mt-3 space-y-3 rounded-lg bg-indigo-900/10 p-3">
                    <input
                      type="number"
                      placeholder="Score (e.g., 85)"
                      value={gradingData.score}
                      onChange={(e) =>
                        setGradingData({
                          ...gradingData,
                          score: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
                    />
                    <textarea
                      placeholder="Feedback"
                      value={gradingData.feedback}
                      onChange={(e) =>
                        setGradingData({
                          ...gradingData,
                          feedback: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleGradeSubmission(submission)}
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
                ) : null}
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
