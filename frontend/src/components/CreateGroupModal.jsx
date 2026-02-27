import { useEffect, useState } from "react";
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
import api from "../api/api";
import StudentSelector from "./StudentSelector";

function CreateGroupModal({ isOpen, onClose, onSuccess, classId, students, loadingStudents }) {
  const [groupName, setGroupName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [leaderId, setLeaderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedStudentIds([]);
      setLeaderId("");
      setError(null);
    }
  }, [isOpen]);

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        const next = prev.filter((id) => id !== studentId);
        if (Number(leaderId) === studentId) {
          setLeaderId("");
        }
        return next;
      }
      return [...prev, studentId];
    });
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.id));
  const isSubmitDisabled =
    loading || !groupName.trim() || selectedStudentIds.length === 0 || !leaderId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError("Select at least one student");
      return;
    }
    if (!leaderId) {
      setError("Select a group leader");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createRes = await api.post(`/classes/${classId}/groups`, {
        name: groupName.trim(),
      });

      const groupId = createRes.data?.group?.id;
      if (!groupId) throw new Error("Failed to create group");

      for (const studentId of selectedStudentIds) {
        await api.post(`/groups/${groupId}/members`, {
          user_id: studentId,
          role: Number(leaderId) === studentId ? "LEADER" : "MEMBER",
        });
      }

      await api.post(`/groups/${groupId}/leader`, {
        user_id: Number(leaderId),
      });

      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Group</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            size="small"
          />

          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.75 }}>
              Students not in any group
            </Typography>
            <StudentSelector
              students={students}
              selectedStudentIds={selectedStudentIds}
              onToggleStudent={handleToggleStudent}
              loading={loadingStudents}
            />
            {!loadingStudents && students.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Selected: {selectedStudentIds.length}
              </Typography>
            )}
          </Box>

          {selectedStudents.length > 0 && (
            <TextField
              label="Group Leader"
              select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Select leader</MenuItem>
              {selectedStudents.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.username}
                </MenuItem>
              ))}
            </TextField>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateGroupModal;