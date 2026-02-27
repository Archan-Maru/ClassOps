import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
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
    <Paper>
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          All Submissions
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Sort by
          </Typography>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={(e, val) => val && setSortBy(val)}
            size="small"
          >
            <ToggleButton value="latest" sx={{ fontSize: "0.75rem", py: 0.25, px: 1.5 }}>
              Latest
            </ToggleButton>
            <ToggleButton value="earliest" sx={{ fontSize: "0.75rem", py: 0.25, px: 1.5 }}>
              Earliest
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Submission rows */}
      <Box sx={{ "& > *:not(:last-child)": { borderBottom: 1, borderColor: "divider" } }}>
        {sortedSubmissions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, py: 3 }}>
            No submissions yet
          </Typography>
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
              <Box
                key={submission.id}
                sx={{
                  px: 3,
                  py: 1.75,
                  transition: "background-color 0.15s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {/* 3-column row: name+time | file | action */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {/* Col 1: student name + submitted time */}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {displayName}
                    </Typography>
                    {submission.submitted_at ? (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                        {new Date(submission.submitted_at).toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                        Not submitted
                      </Typography>
                    )}
                  </Box>

                  {/* Col 2: file name */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      minWidth: 0,
                      maxWidth: 220,
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    {filename ? (
                      <>
                        <AttachFileIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {filename}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        No file
                      </Typography>
                    )}
                  </Box>

                  {/* Col 3: grade badge + action button */}
                  <Box sx={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 1 }}>
                    {submission.evaluation_id && (
                      <Chip
                        label={submission.score ?? "Graded"}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                    {filename && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        onClick={() =>
                          navigate(`/documents/submission-${submission.id}`)
                        }
                        sx={{ fontSize: "0.75rem", py: 0.25, px: 1.25, minWidth: 0 }}
                      >
                        View
                      </Button>
                    )}
                    {submission.submitted_at && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
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
                        sx={{ fontSize: "0.75rem", py: 0.25, px: 1.25, minWidth: 0 }}
                      >
                        {isGrading
                          ? "Cancel"
                          : submission.evaluation_id
                            ? "Edit Grade"
                            : "Grade"}
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Feedback display */}
                {submission.evaluation_id &&
                  submission.feedback &&
                  !isGrading && (
                    <Box sx={{ mt: 1, borderRadius: 2, bgcolor: "action.hover", px: 1.5, py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Feedback:{" "}
                        <Box component="span" sx={{ color: "text.primary" }}>
                          {submission.feedback}
                        </Box>
                      </Typography>
                    </Box>
                  )}

                {/* Grading form */}
                {isGrading && (
                  <Paper variant="outlined" sx={{ mt: 1.5, p: 2 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <TextField
                        type="number"
                        size="small"
                        placeholder="Score (e.g. 85)"
                        value={gradingData.score}
                        onChange={(e) =>
                          setGradingData({
                            ...gradingData,
                            score: e.target.value,
                          })
                        }
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleGradeSubmission(submission)}
                          disabled={submitting}
                          sx={{ flex: 1 }}
                        >
                          {submitting ? "Saving..." : "Save Grade"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setGradingSubmissionId(null);
                            setGradingData({ score: "", feedback: "" });
                          }}
                          sx={{ flex: 1 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                    <TextField
                      placeholder="Feedback (optional)"
                      value={gradingData.feedback}
                      onChange={(e) =>
                        setGradingData({
                          ...gradingData,
                          feedback: e.target.value,
                        })
                      }
                      multiline
                      rows={2}
                      size="small"
                      fullWidth
                      sx={{ mt: 1.5 }}
                    />
                  </Paper>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
}

SubmissionsList.propTypes = {
  assignmentId: PropTypes.number.isRequired,
  submissions: PropTypes.array.isRequired,
  onSubmissionsUpdate: PropTypes.func.isRequired,
};

export default SubmissionsList;