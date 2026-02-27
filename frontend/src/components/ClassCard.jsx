import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

function ClassCard({ id, title, teacher, meta, userRole, onUnenroll }) {
  const initial = (title || "?")[0].toUpperCase();

  const handleUnenroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(`Leave "${title}"? You will need a class code to rejoin.`)
    ) {
      onUnenroll(id);
    }
  };

  return (
    <Paper
      component={Link}
      to={`/classes/${id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      {/* Header band */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: 112,
          bgcolor: "primary.main",
          p: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          sx={{ color: "#fff", lineHeight: 1.3 }}
        >
          {title}
        </Typography>
        {teacher && (
          <Typography
            variant="body2"
            noWrap
            sx={{ mt: 0.25, color: "rgba(255,255,255,0.7)" }}
          >
            {teacher}
          </Typography>
        )}
        <Avatar
          sx={{
            position: "absolute",
            bottom: 0,
            right: 16,
            transform: "translateY(50%)",
            width: 40,
            height: 40,
            bgcolor: "background.paper",
            color: "primary.main",
            fontWeight: 700,
            fontSize: 16,
            border: 2,
            borderColor: "background.paper",
            boxShadow: 1,
          }}
        >
          {initial}
        </Avatar>
      </Box>

      {/* Body */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "flex-end",
          justifyContent: "space-between",
          px: 2,
          pb: 1.5,
          pt: 3,
        }}
      >
        {userRole === "STUDENT" ? (
          <Button
            size="small"
            onClick={handleUnenroll}
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "error.main",
                color: "error.main",
              },
            }}
            variant="outlined"
          >
            Leave
          </Button>
        ) : (
          <span />
        )}
        {meta && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ ml: 1 }}
          >
            {meta}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

ClassCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string,
  meta: PropTypes.string,
  userRole: PropTypes.string,
  onUnenroll: PropTypes.func,
};

ClassCard.defaultProps = {
  teacher: "",
  meta: "",
  userRole: null,
  onUnenroll: () => {},
};

export default ClassCard;
