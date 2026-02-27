import { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import api from "../api/api";

function InviteStudentsModal({ isOpen, onClose, classId }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Invalid email format");
      return;
    }

    if (emails.includes(trimmed)) {
      setError("Email already added");
      return;
    }

    setEmails([...emails, trimmed]);
    setEmailInput("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      setError("Add at least one email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/classes/${classId}/invites`, { emails });
      setResults(res.data.results);
      setEmails([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailInput("");
    setEmails([]);
    setResults(null);
    setError("");
    onClose();
  };

  const statusLabel = (status) => {
    switch (status) {
      case "sent":
        return { text: "Sent", color: "success" };
      case "already_enrolled":
        return { text: "Already enrolled", color: "warning" };
      case "already_invited":
        return { text: "Already invited", color: "warning" };
      case "email_failed":
        return { text: "Email failed", color: "error" };
      default:
        return { text: status, color: "default" };
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Students</DialogTitle>

      {!results ? (
        <>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Send email invites to join this class
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Email Address"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="student@example.com"
                fullWidth
                size="small"
              />
              <Button variant="outlined" onClick={addEmail} sx={{ flexShrink: 0 }}>
                Add
              </Button>
            </Box>

            {emails.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {emails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    size="small"
                    onDelete={() => removeEmail(email)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={loading || emails.length === 0}
            >
              {loading ? "Sending..." : `Send ${emails.length > 0 ? `(${emails.length})` : ""}`}
            </Button>
          </DialogActions>
        </>
      ) : (
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {results.map((r, i) => {
            const label = statusLabel(r.status);
            return (
              <Paper
                key={i}
                variant="outlined"
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}
              >
                <Typography variant="body2">{r.email}</Typography>
                <Chip label={label.text} size="small" color={label.color} />
              </Paper>
            );
          })}
          <Button variant="outlined" onClick={handleClose} fullWidth sx={{ mt: 1 }}>
            Done
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

InviteStudentsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default InviteStudentsModal;