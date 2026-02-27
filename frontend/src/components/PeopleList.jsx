import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

function PeopleList({ people }) {
  if (people.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No students enrolled yet
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {people.map((person) => (
        <Paper
          key={person.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {person.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {person.role}
            </Typography>
          </Box>
          {person.role === "TEACHER" && (
            <Chip label="Teacher" size="small" color="primary" variant="outlined" />
          )}
        </Paper>
      ))}
    </Box>
  );
}

PeopleList.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default PeopleList;