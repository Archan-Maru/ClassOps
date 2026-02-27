import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import api from "../api/api";

function JoinClassModal({ isOpen, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Class code is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/classes/join-by-code", {
        code: code.trim().toUpperCase(),
      });
      setCode("");
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Join a Class</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0 }}
        >
          <Typography variant="body2" color="text.secondary">
            Enter the class code provided by your teacher
          </Typography>
          <TextField
            label="Class Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g., ABC123"
            slotProps={{
              htmlInput: {
                maxLength: 10,
                style: {
                  textAlign: "center",
                  fontSize: "1.125rem",
                  fontFamily: "monospace",
                },
              },
            }}
            fullWidth
            size="small"
          />
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Joining..." : "Join"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default JoinClassModal;
