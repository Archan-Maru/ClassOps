import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SubmissionBox from "../components/SubmissionBox";
import SubmissionsList from "../components/SubmissionsList";
import EvaluationCard from "../components/EvaluationCard";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

function AssignmentDetails() {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [classData, setClassData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isTeacher = classData?.user_role === "TEACHER";

  const fetchSubmissions = async () => {
    if (!isTeacher) return;
    try {
      setSubmissionsLoading(true);
      const res = await api.get(`/submissions/${assignmentId}/submissions`);
      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const refreshAssignmentData = async () => {
    try {
      try {
        const submissionRes = await api.get(
          `/submissions/${assignmentId}/submission`,
        );
        setSubmission(submissionRes.data);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setSubmission(null);
      }

      try {
        const evaluationRes = await api.get(
          `/evaluations/${assignmentId}/evaluation`,
        );
        setEvaluation(evaluationRes.data);
      } catch (err) {
        console.error("Error fetching evaluation:", err);
        setEvaluation(null);
      }

      if (isTeacher) {
        await fetchSubmissions();
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        const assignmentRes = await api.get(
          `/classes/${classId}/assignments/${assignmentId}`,
        );
        setAssignment(assignmentRes.data);

        const classRes = await api.get(`/classes/${classId}`);
        setClassData(classRes.data?.class || null);

        try {
          const submissionRes = await api.get(
            `/submissions/${assignmentId}/submission`,
          );
          setSubmission(submissionRes.data);
        } catch (err) {
          console.error("Error fetching submission:", err);
          setSubmission(null);
        }

        try {
          const evaluationRes = await api.get(
            `/evaluations/${assignmentId}/evaluation`,
          );
          setEvaluation(evaluationRes.data);
        } catch {
          setEvaluation(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assignment");
        console.error("AssignmentDetails fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [classId, assignmentId]);

  useEffect(() => {
    if (isTeacher) {
      fetchSubmissions();
    }
  }, [classData?.user_role, assignmentId]);

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              Loading assignmentâ€¦
            </p>
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/classes/${classId}?tab=assignments`)}
              className="mt-4 rounded-lg bg-violet-600 dark:bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:hover:bg-violet-600"
            >
              Back to Class
            </button>
          </div>
        )}
        {!loading && assignment && classData && (
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            {/* Back link */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate(`/classes/${classId}?tab=assignments`)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to {classData.title}
              </button>
            </div>

            {isTeacher ? (
              <div className="space-y-5">
                {/* Assignment header */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
                  <div className="flex items-start gap-5 px-6 py-6">
                    <div className="w-1 self-stretch rounded-full bg-violet-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {assignment.title}
                      </h1>
                      <div className="mt-1.5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>{classData.teacher_name || "Teacher"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details card â€” 2-col grid */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                    Details
                  </h2>
                  <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Due date
                      </dt>
                      <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                        {formatDate(assignment.deadline)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Type
                      </dt>
                      <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                        {assignment.submission_type || "Individual"}
                      </dd>
                    </div>
                    {assignment.description && (
                      <div className="col-span-2 sm:col-span-3">
                        <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Description
                        </dt>
                        <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                          {assignment.description}
                        </dd>
                      </div>
                    )}
                    {assignment.file_url && (
                      <div>
                        <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Attachment
                        </dt>
                        <dd className="mt-0.5">
                          <Link
                            to={`/documents/assignment-${assignment.id}`}
                            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                          >
                            View Document
                          </Link>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Submissions */}
                {submissionsLoading ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Loading submissionsâ€¦
                  </p>
                ) : (
                  <SubmissionsList
                    assignmentId={assignment.id}
                    submissions={submissions}
                    onSubmissionsUpdate={fetchSubmissions}
                  />
                )}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                  {/* Assignment header */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex items-start gap-5 px-6 py-6">
                      <div className="w-1 self-stretch rounded-full bg-violet-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {assignment.title}
                        </h1>
                        <div className="mt-1.5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <span>{classData.teacher_name || "Teacher"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details card â€” 2-col grid */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-5 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Details
                    </h2>
                    <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
                      <div>
                        <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Due date
                        </dt>
                        <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                          {formatDate(assignment.deadline)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Type
                        </dt>
                        <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                          {assignment.submission_type || "Individual"}
                        </dd>
                      </div>
                      {assignment.description && (
                        <div className="col-span-2">
                          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Description
                          </dt>
                          <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                            {assignment.description}
                          </dd>
                        </div>
                      )}
                      {assignment.file_url && (
                        <div>
                          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Attachment
                          </dt>
                          <dd className="mt-0.5">
                            <Link
                              to={`/documents/assignment-${assignment.id}`}
                              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                            >
                              View Document
                            </Link>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Submission box */}
                  <SubmissionBox
                    assignmentId={assignment.id}
                    hasSubmission={submission?.exists}
                    initialContent={submission?.content}
                    originalFilename={submission?.original_filename}
                    submissionId={submission?.id}
                    onSubmissionSuccess={refreshAssignmentData}
                  />
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                  {/* Your work status */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Your work
                    </h3>
                    {submission?.exists ? (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Submitted
                          </span>
                        </div>
                        {submission.submitted_at && (
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                          <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Not submitted
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Evaluation */}
                  {evaluation && (
                    <EvaluationCard
                      score={evaluation?.score}
                      feedback={evaluation?.feedback}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AssignmentDetails;
