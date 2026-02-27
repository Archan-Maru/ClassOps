import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { formatDate } from "../utils/formatDate";

function AssignmentCard({
  id,
  classId,
  title,
  submissionType,
  deadline,
  status,
  isTeacher,
  onDelete,
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <Paper
      sx={{
        position: "relative",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <Box
        component={Link}
        to={`/classes/${classId}/assignments/${id}`}
        sx={{ display: "block", p: 2.5, textDecoration: "none", color: "inherit" }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1, pr: 4 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
              <Chip
                label={submissionType}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Due: {formatDate(deadline)}
            </Typography>
          </Box>
          {!isTeacher && status && (
            <Chip
              label={status}
              size="small"
              color={status === "Submitted" ? "success" : "warning"}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Box>
        <Box
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: "primary.main",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          View Assignment
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {isTeacher && onDelete && (
        <Box sx={{ position: "absolute", right: 12, top: 12, display: "flex", alignItems: "center", gap: 0.5 }}>
          {confirming ? (
            <>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={deleting}
                sx={{ fontSize: "0.75rem", py: 0.25, px: 1.25, minWidth: 0 }}
              >
                {deleting ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelDelete}
                sx={{ fontSize: "0.75rem", py: 0.25, px: 1.25, minWidth: 0 }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <IconButton
              size="small"
              onClick={handleDelete}
              title="Delete assignment"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main", bgcolor: "error.lighter" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Paper>
  );
}

AssignmentCard.propTypes = {
  id: PropTypes.number.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  submissionType: PropTypes.oneOf(["INDIVIDUAL", "GROUP"]).isRequired,
  deadline: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["Pending", "Submitted"]),
  isTeacher: PropTypes.bool,
  onDelete: PropTypes.func,
};

AssignmentCard.defaultProps = {
  status: "",
  isTeacher: false,
  onDelete: null,
};

export default AssignmentCard;