import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatDate, relativeDeadline } from "../utils/formatDate";

/**
 * Minimal assignment item - clean, calm design
 */
function AssignmentItem({ assignment, onClick, isOverdue = false }) {
  const deadlineRaw = assignment.deadline || assignment.due;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: isOverdue ? "error.main" : "primary.main",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.01)",
        },
      }}
    >
      <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
        {assignment.title}
      </Typography>
      {assignment.className && (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: "block" }}
        >
          {assignment.className}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5 }}
      >
        Due: {formatDate(deadlineRaw)}
      </Typography>
      {isOverdue && (
        <Typography
          variant="caption"
          color="error.main"
          fontWeight={500}
          sx={{ display: "block", mt: 0.5 }}
        >
          {Math.floor(
            (new Date() - new Date(deadlineRaw)) / (1000 * 60 * 60 * 24)
          )}{" "}
          days overdue
        </Typography>
      )}
    </Box>
  );
}

AssignmentItem.propTypes = {
  assignment: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  isOverdue: PropTypes.bool,
};

function UpcomingPanel({ assignments, userRole = "STUDENT" }) {
  const navigate = useNavigate();

  const deduplicatedAssignments = Array.from(
    new Map(assignments?.map((a) => [a.id, a]) || []).values()
  );

  const handleClick = (classId, assignmentId) => {
    if (classId && assignmentId) {
      navigate(`/classes/${classId}/assignments/${assignmentId}`);
    }
  };

  // Teacher view
  if (userRole === "TEACHER") {
    const filteredList = deduplicatedAssignments
      .filter((a) => {
        const deadline = a.deadline || a.due;
        if (!deadline) return false;
        return new Date(deadline) < new Date();
      })
      .sort(
        (a, b) => new Date(a.deadline || a.due) - new Date(b.deadline || b.due)
      );

    return (
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Pending Grading
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Past deadline assignments
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: 380,
            overflowY: "auto",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {filteredList.length > 0 ? (
            filteredList.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                isOverdue
                onClick={() => handleClick(assignment.classId, assignment.id)}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No assignments pending grading
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  // Student view
  const overdueList = [];
  const upcomingList = [];

  deduplicatedAssignments.forEach((a) => {
    if (a.status === "Submitted") return;
    const deadlineRaw = a.deadline || a.due;
    const relative = relativeDeadline(deadlineRaw);
    if (relative === "Overdue") {
      overdueList.push(a);
    } else {
      upcomingList.push(a);
    }
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Upcoming */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Upcoming
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: 280,
            overflowY: "auto",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {upcomingList.length > 0 ? (
            upcomingList.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleClick(assignment.classId, assignment.id)}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No upcoming assignments
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Overdue */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={600} color="error.main">
            Overdue
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: 280,
            overflowY: "auto",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {overdueList.length > 0 ? (
            overdueList.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                isOverdue
                onClick={() => handleClick(assignment.classId, assignment.id)}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No overdue assignments
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

UpcomingPanel.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  userRole: PropTypes.oneOf(["TEACHER", "STUDENT"]),
};

export default UpcomingPanel;
