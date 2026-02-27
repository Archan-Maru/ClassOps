import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatDate } from "../utils/formatDate";

function ClassworkCard({
  id,
  title,
  description,
  resourceUrl,
  createdAt,
  isTeacher,
  onDelete,
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
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

  return (
    <Paper
      sx={{
        position: "relative",
        p: 2.5,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1, pr: 4 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              {description}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 1, display: "block" }}
          >
            Uploaded {formatDate(createdAt, { includeTime: true })}
          </Typography>
        </Box>
      </Box>
      {resourceUrl && (
        <Button
          component={Link}
          to={`/documents/classwork-${id}`}
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon />}
          sx={{ mt: 2 }}
        >
          View Material
        </Button>
      )}

      {isTeacher && onDelete && (
        <Box
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
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
                onClick={() => setConfirming(false)}
                sx={{ fontSize: "0.75rem", py: 0.25, px: 1.25, minWidth: 0 }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <IconButton
              size="small"
              onClick={handleDelete}
              title="Delete classwork"
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

ClassworkCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  resourceUrl: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  isTeacher: PropTypes.bool,
  onDelete: PropTypes.func,
};

ClassworkCard.defaultProps = {
  description: "",
  resourceUrl: "",
  isTeacher: false,
  onDelete: null,
};

export default ClassworkCard;
