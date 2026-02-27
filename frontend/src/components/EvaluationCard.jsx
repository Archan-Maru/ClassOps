import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function EvaluationCard({ score, feedback }) {
  if (!score && !feedback) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2">Evaluation</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          No evaluation yet. Your teacher will review your submission soon.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2">Evaluation</Typography>

      {score && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight={500} color="text.secondary">
            Score
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
            sx={{ mt: 0.5 }}
          >
            {score}
          </Typography>
        </Box>
      )}

      {feedback && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight={500} color="text.secondary">
            Feedback
          </Typography>
          <Box
            sx={{
              mt: 1,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
              p: 1.5,
            }}
          >
            <Typography variant="body2" color="text.primary">
              {feedback}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

EvaluationCard.propTypes = {
  score: PropTypes.string,
  feedback: PropTypes.string,
};

EvaluationCard.defaultProps = {
  score: "",
  feedback: "",
};

export default EvaluationCard;
