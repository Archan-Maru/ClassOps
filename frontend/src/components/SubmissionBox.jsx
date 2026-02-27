import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Your Submission
        </Typography>
        <Box
          sx={{
            mt: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <InsertDriveFileIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={500} noWrap title={displayName}>
              {displayName}
            </Typography>
          </Box>
          {submissionId && (
            <Button
              component={Link}
              to={`/documents/submission-${submissionId}`}
              size="small"
              startIcon={<VisibilityIcon />}
              sx={{ mt: 1.5, color: "primary.main" }}
            >
              View Submission
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleEdit}
            sx={{ flex: 1 }}
          >
            Edit Submission
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleRemove}
            disabled={isRemoving}
            sx={{ flex: 1 }}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        Submit Your Work
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          Attach file
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />

        <Box
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
          sx={{
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "divider",
            bgcolor: "action.hover",
            px: 2,
            py: 1.5,
            transition: "border-color 0.2s",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Click to attach a file or drag it here
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse
          </Button>
        </Box>

        {file && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
              px: 1.5,
              py: 1,
            }}
          >
            <Typography variant="body2" noWrap sx={{ maxWidth: 240 }}>
              {file.name}
            </Typography>
            <Button
              size="small"
              onClick={() => setFile(null)}
              sx={{ ml: "auto", minWidth: 0, fontSize: "0.75rem" }}
            >
              Remove
            </Button>
          </Box>
        )}

        {submission && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Current file:
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {(() => {
                const url = submission;
                const filename = url.split("/").pop().split("?")[0];
                return (
                  <Button
                    component={Link}
                    to={`/documents/submission-${submissionId}`}
                    size="small"
                    startIcon={<InsertDriveFileIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: "primary.main" }}
                  >
                    {filename}
                  </Button>
                );
              })()}
            </Box>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={!file || isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </Paper>
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