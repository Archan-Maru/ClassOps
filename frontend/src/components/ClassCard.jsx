import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";

/**
 * ClassCard - Minimal, calm class card
 *
 * Design: Notion/Linear inspired
 * - White/neutral background
 * - Subtle border (no colored header)
 * - 12px rounded corners
 * - Clear typography hierarchy
 * - Subtle hover interaction
 * - Non-owner: leave icon (top right)
 */
function ClassCard({
  id,
  title,
  teacher,
  meta,
  isOwner,
  onUnenroll,
  studentCount,
  assignmentCount,
}) {
  const handleLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(`Are you sure you want to leave "${title}"?\n\nYou will need a class code to rejoin.`)
    ) {
      onUnenroll(id);
    }
  };

  return (
    <Paper
      component={Link}
      to={`/classes/${id}`}
      variant="outlined"
      sx={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        p: 2.5,
        position: "relative",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.01)",
        },
      }}
    >
      {/* Leave button - top right (only for non-owners) */}
      {!isOwner && (
        <IconButton
          size="small"
          onClick={handleLeave}
          title="Leave class"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
            opacity: 0.6,
            transition: "all 0.15s ease",
            "&:hover": {
              opacity: 1,
              color: "error.main",
              bgcolor: "error.light",
            },
          }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      )}

      {/* Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          lineHeight: 1.4,
          mb: 0.5,
          pr: isOwner ? 0 : 4, // Space for action button only if shown
        }}
        noWrap
      >
        {title}
      </Typography>

      {/* Subtitle - Teacher */}
      {teacher && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 1.5 }}
          noWrap
        >
          {teacher}
        </Typography>
      )}

      {/* Metadata */}
      {(studentCount !== undefined || assignmentCount !== undefined || meta) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {studentCount !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {studentCount} students
            </Typography>
          )}
          {assignmentCount !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {assignmentCount} assignments
            </Typography>
          )}
          {meta && !studentCount && !assignmentCount && (
            <Typography variant="caption" color="text.secondary">
              {meta}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

ClassCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string,
  meta: PropTypes.string,
  isOwner: PropTypes.bool,
  onUnenroll: PropTypes.func,
  studentCount: PropTypes.number,
  assignmentCount: PropTypes.number,
};

ClassCard.defaultProps = {
  teacher: "",
  meta: "",
  isOwner: false,
  onUnenroll: () => {},
  studentCount: undefined,
  assignmentCount: undefined,
};

export default ClassCard;
