import { useState } from "react";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

function ClassHeader({ title, teacher, semester, classCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(classCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 3, borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
        {teacher}
      </Typography>
      {semester && (
        <Typography
          variant="caption"
          sx={{ mt: 0.25, display: "block", color: "text.disabled" }}
        >
          {semester}
        </Typography>
      )}
      {classCode && (
        <Box
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
            border: 1,
            borderColor: "primary.light",
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(124,58,237,0.12)"
                : "rgba(124,58,237,0.06)",
            px: 1.5,
            py: 0.75,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "primary.main",
            }}
          >
            Class Code
          </Typography>
          <Chip
            label={classCode}
            size="small"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.05em",
              fontSize: "0.875rem",
              bgcolor: "background.paper",
              color: "primary.dark",
              border: 1,
              borderColor: "primary.light",
            }}
          />
          <IconButton
            size="small"
            onClick={handleCopy}
            title="Copy class code"
            sx={{ color: "primary.main", ml: 0.5 }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 14, color: "success.main" }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Box>
      )}
    </Paper>
  );
}

ClassHeader.propTypes = {
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string.isRequired,
  semester: PropTypes.string,
  classCode: PropTypes.string,
};

ClassHeader.defaultProps = {
  semester: "",
  classCode: "",
};

export default ClassHeader;
