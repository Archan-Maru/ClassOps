import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import api from "../api/api";

function AddGroupMemberModal({ isOpen, onClose, onSuccess, groupId, students, groupName, loadingStudents }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      setError("Please select a student");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post(`/groups/${groupId}/members`, {
        user_id: Number(selectedUserId),
      });
      setSelectedUserId("");
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Group Member</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {groupName}
          </Typography>

          <TextField
            label="Available Students"
            select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loadingStudents || students.length === 0}
            fullWidth
            size="small"
          >
            <MenuItem value="">Select a student</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.username}
              </MenuItem>
            ))}
          </TextField>
          {loadingStudents && (
            <Typography variant="body2" color="text.secondary">
              Loading available students...
            </Typography>
          )}
          {!loadingStudents && students.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No available students to add
            </Typography>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingStudents || students.length === 0 || !selectedUserId}
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

AddGroupMemberModal.defaultProps = {
  students: [],
  groupName: "",
  loadingStudents: false,
};

export default AddGroupMemberModal;