import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function UpcomingPanel({ assignments }) {
  const overdueList = [];
  const upcomingList = [];

  if (assignments && assignments.length > 0) {
    assignments.forEach((a) => {
      const deadlineRaw = a.deadline || a.due;
      const relative = relativeDeadline(deadlineRaw);
      if (relative === "Overdue") {
        overdueList.push(a);
      } else {
        upcomingList.push(a);
      }
    });
  }

  const hasNothing = overdueList.length === 0 && upcomingList.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Upcoming section */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1.5 }}>
          <Typography variant="subtitle2">Upcoming</Typography>
        </Box>
        <Box sx={{ maxHeight: 208, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {upcomingList.length > 0 ? (
            upcomingList.map((assignment) => {
              const deadlineRaw = assignment.deadline || assignment.due;
              const relative = relativeDeadline(deadlineRaw);
              return (
                <Box
                  key={assignment.id}
                  sx={{ borderLeft: 2, borderColor: "primary.main", pl: 1.5, py: 0.75 }}
                >
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {assignment.title}
                  </Typography>
                  {assignment.className && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {assignment.className}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                    {formatDate(deadlineRaw)}
                  </Typography>
                  <Typography variant="caption" fontWeight={500} color="primary.main">
                    {relative}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ py: 1.5, textAlign: "center" }}>
              No upcoming assignments
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Overdue section */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" color="error.main">Overdue</Typography>
        </Box>
        <Box sx={{ maxHeight: 208, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {overdueList.length > 0 ? (
            overdueList.map((assignment) => {
              const deadlineRaw = assignment.deadline || assignment.due;
              return (
                <Box
                  key={assignment.id}
                  sx={{ borderLeft: 2, borderColor: "error.main", pl: 1.5, py: 0.75 }}
                >
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {assignment.title}
                  </Typography>
                  {assignment.className && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {assignment.className}
                    </Typography>
                  )}
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.25, display: "block" }}>
                    {formatDate(deadlineRaw)}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="error.main">
                    Overdue
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ py: 1.5, textAlign: "center" }}>
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
    }),
  ).isRequired,
};

export default UpcomingPanel;