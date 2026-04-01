import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function UpcomingPanel({ assignments, userRole = "STUDENT" }) {
  const navigate = useNavigate();
  // For teachers: show assignments with passed deadlines that have ungraded submissions
  // For students: show upcoming and overdue assignments that are not submitted
  
  // Deduplicate assignments by ID
  const deduplicatedAssignments = Array.from(
    new Map(assignments?.map(a => [a.id, a]) || []).values()
  );
  
  let filteredList = [];
  let listTitle = "Upcoming";
  let listSubtitle = "";
  let emptyMessage = "No upcoming assignments";
  let borderColor = "primary.main";

  if (userRole === "TEACHER") {
    // Filter assignments with past deadlines and ungraded/unsubmitted work
    filteredList = deduplicatedAssignments
      .filter((a) => {
        const deadline = a.deadline || a.due;
        if (!deadline) return false;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        // Show assignments past deadline
        return deadlineDate < now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.deadline || a.due);
        const dateB = new Date(b.deadline || b.due);
        return dateA - dateB; // Sort by increasing deadline
      });
    
    listTitle = "Pending Grading";
    listSubtitle = "Past deadline assignments";
    emptyMessage = "No assignments pending grading";
    borderColor = "warning.main";
  } else {
    // Student view: show upcoming and overdue assignments that are not submitted
    const overdueList = [];
    const upcomingList = [];

    if (deduplicatedAssignments && deduplicatedAssignments.length > 0) {
      deduplicatedAssignments.forEach((a) => {
        // Skip assignments that have been submitted
        if (a.status === "Submitted") {
          return;
        }
        
        const deadlineRaw = a.deadline || a.due;
        const relative = relativeDeadline(deadlineRaw);
        if (relative === "Overdue") {
          overdueList.push(a);
        } else {
          upcomingList.push(a);
        }
      });
    }

    // Render student view with both sections
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Upcoming section */}
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1.5 }}>
            <Typography variant="subtitle2">Upcoming</Typography>
          </Box>
          <Box
            sx={{
              maxHeight: 208,
              overflowY: "auto",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(124, 58, 237, 0.4)",
                borderRadius: "4px",
                "&:hover": {
                  background: "rgba(124, 58, 237, 0.6)",
                },
              },
            }}
          >
            {upcomingList.length > 0 ? (
              upcomingList.map((assignment) => {
                const deadlineRaw = assignment.deadline || assignment.due;
                const relative = relativeDeadline(deadlineRaw);
                const classId = assignment.classId;
                const assignmentId = assignment.id;
                return (
                  <Box
                    key={assignment.id}
                    onClick={() => {
                      if (classId && assignmentId) {
                        navigate(`/classes/${classId}/assignments/${assignmentId}`);
                      }
                    }}
                    sx={{
                      borderLeft: 2,
                      borderColor: "primary.main",
                      pl: 1.5,
                      py: 0.75,
                      cursor: classId && assignmentId ? "pointer" : "default",
                      transition: "all 0.2s",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderLeftColor: "primary.light",
                      },
                    }}
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
            <Typography variant="subtitle2" color="error.main">
              Overdue
            </Typography>
          </Box>
          <Box
            sx={{
              maxHeight: 208,
              overflowY: "auto",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(124, 58, 237, 0.4)",
                borderRadius: "4px",
                "&:hover": {
                  background: "rgba(124, 58, 237, 0.6)",
                },
              },
            }}
          >
            {overdueList.length > 0 ? (
              overdueList.map((assignment) => {
                const deadlineRaw = assignment.deadline || assignment.due;
                const classId = assignment.classId;
                const assignmentId = assignment.id;
                return (
                  <Box
                    key={assignment.id}
                    onClick={() => {
                      if (classId && assignmentId) {
                        navigate(`/classes/${classId}/assignments/${assignmentId}`);
                      }
                    }}
                    sx={{
                      borderLeft: 2,
                      borderColor: "error.main",
                      pl: 1.5,
                      py: 0.75,
                      cursor: classId && assignmentId ? "pointer" : "default",
                      transition: "all 0.2s",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderLeftColor: "error.light",
                      },
                    }}
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

  // Teacher view: show pending grading
  return (
    <Paper>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" color="warning.main">
            {listTitle}
          </Typography>
          {listSubtitle && (
            <Typography variant="caption" color="text.secondary">
              {listSubtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          maxHeight: 416,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(124, 58, 237, 0.4)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(124, 58, 237, 0.6)",
            },
          },
        }}
      >
        {filteredList.length > 0 ? (
          filteredList.map((assignment) => {
            const deadlineRaw = assignment.deadline || assignment.due;
            const classId = assignment.classId;
            const assignmentId = assignment.id;
            const daysPassed = Math.floor(
              (new Date() - new Date(deadlineRaw)) / (1000 * 60 * 60 * 24)
            );
            return (
              <Box
                key={assignment.id}
                onClick={() => {
                  if (classId && assignmentId) {
                    navigate(`/classes/${classId}/assignments/${assignmentId}`);
                  }
                }}
                sx={{
                  borderLeft: 2,
                  borderColor: "warning.main",
                  pl: 1.5,
                  py: 0.75,
                  cursor: classId && assignmentId ? "pointer" : "default",
                  transition: "all 0.2s",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                    borderLeftColor: "warning.light",
                  },
                }}
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
                  Due: {formatDate(deadlineRaw)}
                </Typography>
                <Typography variant="caption" fontWeight={500} color="warning.main">
                  {daysPassed} day{daysPassed !== 1 ? "s" : ""} overdue
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ py: 1.5, textAlign: "center" }}>
            {emptyMessage}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

UpcomingPanel.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  userRole: PropTypes.oneOf(["TEACHER", "STUDENT"]),
};

export default UpcomingPanel;