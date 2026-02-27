import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function AssignmentItem({ title, className, due }) {
  const relative = relativeDeadline(due);
  const isOverdue = relative === "Overdue";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        borderLeft: 4,
        borderColor: isOverdue ? "error.main" : "primary.main",
        bgcolor: "background.paper",
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        boxShadow: 1,
        transition: "background-color 0.15s",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {title}
        </Typography>
        {className && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.25, display: "block" }}>
            {className}
          </Typography>
        )}
        <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              color: isOverdue ? "error.main" : "text.disabled",
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {isOverdue ? "Overdue \u00B7 " : ""}
            {formatDate(due)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

AssignmentItem.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  due: PropTypes.string,
};

AssignmentItem.defaultProps = {
  className: "",
  due: "",
};

export default AssignmentItem;