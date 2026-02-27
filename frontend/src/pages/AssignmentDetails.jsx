import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  const AssignmentHeader = () => (
    <Paper sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, px: 3, py: 3 }}>
        <Box sx={{ width: 4, alignSelf: "stretch", borderRadius: 1, bgcolor: "primary.main", flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {assignment.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {classData.teacher_name || "Teacher"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const DetailsCard = ({ colsClass }) => (
    <Paper sx={{ px: 3, py: 2.5 }}>
      <Typography variant="overline" color="text.disabled" fontWeight={600}>
        Details
      </Typography>
      <Box
        component="dl"
        sx={{
          mt: 1.5,
          display: "grid",
          gridTemplateColumns: colsClass || { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
          columnGap: 4,
          rowGap: 1.5,
        }}
      >
        <Box>
          <Typography component="dt" variant="caption" color="text.secondary" fontWeight={500}>
            Due date
          </Typography>
          <Typography component="dd" variant="body2" sx={{ mt: 0.25 }}>
            {formatDate(assignment.deadline)}
          </Typography>
        </Box>
        <Box>
          <Typography component="dt" variant="caption" color="text.secondary" fontWeight={500}>
            Type
          </Typography>
          <Typography component="dd" variant="body2" sx={{ mt: 0.25 }}>
            {assignment.submission_type || "Individual"}
          </Typography>
        </Box>
        {assignment.description && (
          <Box sx={{ gridColumn: colsClass ? "span 2" : { xs: "span 2", sm: "span 3" } }}>
            <Typography component="dt" variant="caption" color="text.secondary" fontWeight={500}>
              Description
            </Typography>
            <Typography component="dd" variant="body2" sx={{ mt: 0.25 }}>
              {assignment.description}
            </Typography>
          </Box>
        )}
        {assignment.file_url && (
          <Box>
            <Typography component="dt" variant="caption" color="text.secondary" fontWeight={500}>
              Attachment
            </Typography>
            <Typography component="dd" sx={{ mt: 0.25 }}>
              <Button
                component={Link}
                to={`/documents/assignment-${assignment.id}`}
                size="small"
                sx={{ p: 0, minWidth: 0, color: "primary.main" }}
              >
                View Document
              </Button>
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

  return (
    <>
      <AppHeader />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Loading assignment...
            </Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ maxWidth: 896, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate(`/classes/${classId}?tab=assignments`)}
              sx={{ mt: 2 }}
            >
              Back to Class
            </Button>
          </Box>
        )}
        {!loading && assignment && classData && (
          <Box sx={{ maxWidth: 896, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
            {/* Back link */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate(`/classes/${classId}?tab=assignments`)}
                sx={{ color: "primary.main" }}
              >
                Back to {classData.title}
              </Button>
            </Box>

            {isTeacher ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <AssignmentHeader />
                <DetailsCard colsClass={{ xs: "1fr 1fr", sm: "1fr 1fr 1fr" }} />

                {submissionsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading submissions...
                  </Typography>
                ) : (
                  <SubmissionsList
                    assignmentId={assignment.id}
                    submissions={submissions}
                    onSubmissionsUpdate={fetchSubmissions}
                  />
                )}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { lg: "2fr 1fr" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <AssignmentHeader />
                  <DetailsCard colsClass="1fr 1fr" />
                  <SubmissionBox
                    assignmentId={assignment.id}
                    hasSubmission={submission?.exists}
                    initialContent={submission?.content}
                    originalFilename={submission?.original_filename}
                    submissionId={submission?.id}
                    onSubmissionSuccess={refreshAssignmentData}
                  />
                </Box>

                {/* Right sidebar */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Paper sx={{ px: 2.5, py: 2.5 }}>
                    <Typography variant="subtitle2">Your work</Typography>
                    {submission?.exists ? (
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          label="Submitted"
                          size="small"
                          color="success"
                          icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />}
                        />
                        {submission.submitted_at && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            {new Date(submission.submitted_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          label="Not submitted"
                          size="small"
                          color="warning"
                          icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "warning.main" }} />}
                        />
                      </Box>
                    )}
                  </Paper>

                  {evaluation && (
                    <EvaluationCard
                      score={evaluation?.score}
                      feedback={evaluation?.feedback}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}

export default AssignmentDetails;