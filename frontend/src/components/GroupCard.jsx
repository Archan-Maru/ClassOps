import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

function GroupCard({
  group,
  isTeacher,
  onAddMember,
  onRemoveMember,
  onAssignLeader,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRemovePicker, setShowRemovePicker] = useState(false);
  const [showLeaderPicker, setShowLeaderPicker] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");

  const normalizedMembers = useMemo(
    () =>
      (group.members || []).map((member) => ({
        ...member,
        normalizedRole: String(member.role || "").toUpperCase(),
      })),
    [group.members],
  );

  const leader = normalizedMembers.find(
    (member) => member.normalizedRole === "LEADER",
  );
  const removableMembers = normalizedMembers.filter(
    (member) => member.normalizedRole !== "LEADER",
  );

  const toggleCard = () => {
    setIsExpanded((prev) => !prev);
    setShowRemovePicker(false);
    setShowLeaderPicker(false);
    setSelectedMemberId("");
    setSelectedLeaderId("");
  };

  const handleRemoveSubmit = () => {
    if (!selectedMemberId) return;
    onRemoveMember(group.id, Number(selectedMemberId));
    setShowRemovePicker(false);
    setSelectedMemberId("");
  };

  const handleAssignLeaderSubmit = () => {
    if (!selectedLeaderId) return;
    onAssignLeader(group.id, Number(selectedLeaderId));
    setShowLeaderPicker(false);
    setSelectedLeaderId("");
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Box
        component="button"
        type="button"
        onClick={toggleCard}
        sx={{ width: "100%", textAlign: "left", background: "none", border: "none", p: 0, cursor: "pointer", color: "inherit" }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {group.name}
          </Typography>
          {isTeacher && (
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => { e.stopPropagation(); onAddMember(group); }}
                sx={{ fontSize: "0.75rem" }}
              >
                Add Member
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); setShowRemovePicker((p) => !p); setShowLeaderPicker(false); }}
                sx={{ fontSize: "0.75rem" }}
              >
                Remove Member
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); setShowLeaderPicker((p) => !p); setShowRemovePicker(false); }}
                sx={{ fontSize: "0.75rem" }}
              >
                Assign Leader
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Leader:{" "}
          <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
            {leader?.username || "Not assigned"}
          </Box>
        </Typography>
      </Box>

      {isTeacher && showRemovePicker && (
        <Box sx={{ mt: 1.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "action.hover", p: 1.5 }}>
          <Typography variant="caption" fontWeight={500}>Remove a member</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <TextField
              select
              size="small"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              sx={{ flex: 1 }}
              placeholder="Select member"
            >
              <MenuItem value="">Select member</MenuItem>
              {removableMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.username}
                </MenuItem>
              ))}
            </TextField>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleRemoveSubmit}
              disabled={!selectedMemberId}
            >
              Remove
            </Button>
          </Box>
        </Box>
      )}

      {isTeacher && showLeaderPicker && (
        <Box sx={{ mt: 1.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "action.hover", p: 1.5 }}>
          <Typography variant="caption" fontWeight={500}>Assign leader</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <TextField
              select
              size="small"
              value={selectedLeaderId}
              onChange={(e) => setSelectedLeaderId(e.target.value)}
              sx={{ flex: 1 }}
              placeholder="Select member"
            >
              <MenuItem value="">Select member</MenuItem>
              {normalizedMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.username}
                </MenuItem>
              ))}
            </TextField>
            <Button
              size="small"
              variant="contained"
              onClick={handleAssignLeaderSubmit}
              disabled={!selectedLeaderId}
            >
              Assign
            </Button>
          </Box>
        </Box>
      )}

      {isExpanded && normalizedMembers.length > 0 ? (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {normalizedMembers.map((member) => (
            <Box
              key={member.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 2,
                bgcolor: "action.hover",
                px: 1.5,
                py: 1,
              }}
            >
              <Typography variant="body2">{member.username}</Typography>
              {member.normalizedRole === "LEADER" ? (
                <Chip label="Leader" size="small" color="warning" sx={{ fontSize: "0.75rem" }} />
              ) : (
                <Typography variant="caption" color="text.disabled">Member</Typography>
              )}
            </Box>
          ))}
        </Box>
      ) : null}

      {isExpanded && normalizedMembers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          No members yet
        </Typography>
      ) : null}
    </Paper>
  );
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  isTeacher: PropTypes.bool,
  onAddMember: PropTypes.func,
  onRemoveMember: PropTypes.func,
  onAssignLeader: PropTypes.func,
};

GroupCard.defaultProps = {
  isTeacher: false,
  onAddMember: () => {},
  onRemoveMember: () => {},
  onAssignLeader: () => {},
};

export default GroupCard;