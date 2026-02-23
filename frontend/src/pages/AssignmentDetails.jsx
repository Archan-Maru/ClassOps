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
      <div className="min-h-screen bg-slate-950">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Loading assignment...</p>
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-6xl px-4 py-8">
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => navigate(`/classes/${classId}`)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Back to Class
            </button>
          </div>
        )}
        {!loading && assignment && classData && (
          <>
            <div className="border-b border-slate-700 bg-slate-900 px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-6xl">
                <button
                  type="button"
                  onClick={() => navigate(`/classes/${classId}`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  ← Back to {classData.title}
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
              {isTeacher ? (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-100">
                      {assignment.title}
                    </h1>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                      <span>{classData.teacher_name || "Teacher"}</span>
                      <span>•</span>
                      <span>{formatDate(assignment.deadline)}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
                    <h2 className="text-lg font-semibold text-slate-100">
                      Details
                    </h2>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Type
                        </p>
                        <p className="mt-1 text-slate-400">
                          {assignment.submission_type || "Individual"}
                        </p>
                      </div>
                      {assignment.description && (
                        <div>
                          <p className="text-sm font-medium text-slate-300">
                            Description
                          </p>
                          <p className="mt-1 text-slate-400">
                            {assignment.description}
                          </p>
                        </div>
                      )}
                      {assignment.file_url && (
                        <div>
                          <p className="text-sm font-medium text-slate-300">
                            Attachment
                          </p>
                          <Link
                            to={`/documents/assignment-${assignment.id}`}
                            className="mt-1 inline-block text-indigo-400 hover:text-indigo-300 underline"
                          >
                            View Document
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {submissionsLoading ? (
                    <p className="text-slate-400">Loading submissions...</p>
                  ) : (
                    <SubmissionsList
                      assignmentId={assignment.id}
                      submissions={submissions}
                      onSubmissionsUpdate={fetchSubmissions}
                    />
                  )}
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h1 className="text-4xl font-bold text-slate-100">
                        {assignment.title}
                      </h1>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                        <span>{classData.teacher_name || "Teacher"}</span>
                        <span>•</span>
                        <span>{formatDate(assignment.deadline)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
                      <h2 className="text-lg font-semibold text-slate-100">
                        Details
                      </h2>
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-300">
                            Type
                          </p>
                          <p className="mt-1 text-slate-400">
                            {assignment.submission_type || "Individual"}
                          </p>
                        </div>
                        {assignment.description && (
                          <div>
                            <p className="text-sm font-medium text-slate-300">
                              Description
                            </p>
                            <p className="mt-1 text-slate-400">
                              {assignment.description}
                            </p>
                          </div>
                        )}
                        {assignment.file_url && (
                          <div>
                            <p className="text-sm font-medium text-slate-300">
                              Attachment
                            </p>
                            <Link
                              to={`/documents/assignment-${assignment.id}`}
                              className="mt-1 inline-block text-indigo-400 hover:text-indigo-300 underline"
                            >
                              View Document
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <SubmissionBox
                        assignmentId={assignment.id}
                        hasSubmission={submission?.exists}
                        initialContent={submission?.content}
                        submissionId={submission?.id}
                        onSubmissionSuccess={refreshAssignmentData}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
                      <h3 className="text-lg font-semibold text-slate-100">
                        Your work
                      </h3>
                      {submission?.exists ? (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-green-900/20 px-3 py-2">
                            <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            <span className="text-sm font-medium text-green-300">
                              Submitted
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {submission.submitted_at &&
                              new Date(
                                submission.submitted_at,
                              ).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 rounded-lg bg-yellow-900/20 px-3 py-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                            <span className="text-sm font-medium text-yellow-300">
                              Not submitted
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {evaluation && (
                      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
                        <EvaluationCard
                          score={evaluation?.score}
                          feedback={evaluation?.feedback}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AssignmentDetails;
