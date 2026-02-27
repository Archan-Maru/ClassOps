import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import api from "../api/api";

function CreateClassworkModal({ isOpen, onClose, onSuccess, classId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (attachedFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("file", attachedFile);

        await api.post(`/classes/${classId}/classwork`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/classes/${classId}/classwork`, {
          title: title.trim(),
          description: description.trim(),
        });
      }
      setTitle("");
      setDescription("");
      setAttachedFile(null);
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle1" fontWeight={600}>
          New Announcement
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            fullWidth
            size="small"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            fullWidth
            size="small"
            multiline
            rows={3}
          />

          {/* Attachment */}
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.75 }}>
              Attachment <Typography component="span" variant="body2" color="text.disabled">(optional)</Typography>
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            {attachedFile ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, border: 1, borderColor: "divider", borderRadius: 2, px: 1.5, py: 1 }}>
                <AttachFileIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {attachedFile.name}
                </Typography>
                <Button size="small" color="error" onClick={() => setAttachedFile(null)} sx={{ minWidth: 0 }}>
                  Remove
                </Button>
              </Box>
            ) : (
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  border: 2,
                  borderStyle: "dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  px: 2,
                  py: 2,
                  cursor: "pointer",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <AttachFileIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Click to attach or drag a file here
                </Typography>
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
            {loading ? "Saving..." : "Post"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateClassworkModal;