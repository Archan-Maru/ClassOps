import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import api from "../api/api";

function CreateAssignmentModal({ isOpen, onClose, onSuccess, classId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissionType, setSubmissionType] = useState("INDIVIDUAL");
  const [deadline, setDeadline] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !deadline) {
      setError("Title and deadline are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (attachedFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("submission_type", submissionType);
        formData.append("deadline", deadline);
        formData.append("file", attachedFile);

        await api.post(`/classes/${classId}/assignments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/classes/${classId}/assignments`, {
          title: title.trim(),
          description: description.trim(),
          submission_type: submissionType,
          deadline,
        });
      }
      setTitle("");
      setDescription("");
      setDeadline("");
      setAttachedFile(null);
      setSubmissionType("INDIVIDUAL");
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Assignment</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
          <TextField
            label="Submission Type"
            select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="INDIVIDUAL">Individual</MenuItem>
            <MenuItem value="GROUP">Group</MenuItem>
          </TextField>
          <TextField
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* File attachment */}
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.75 }}>
              Attach file (optional)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
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
                if (f) setAttachedFile(f);
              }}
              sx={{
                border: 2,
                borderStyle: "dashed",
                borderColor: "divider",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Click to attach a file or drag it here.
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Attach
              </Button>
            </Box>

            {attachedFile && (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <AttachFileIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {attachedFile.name}
                </Typography>
                <Button size="small" onClick={() => setAttachedFile(null)} sx={{ minWidth: 0 }}>
                  Remove
                </Button>
              </Box>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateAssignmentModal;