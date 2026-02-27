import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

function StudentSelector({ students, selectedStudentIds, onToggleStudent, loading }) {
  return (
    <Box
      sx={{
        mt: 1,
        maxHeight: 224,
        overflowY: "auto",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      {loading && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1.5 }}>
          Loading students...
        </Typography>
      )}

      {!loading && students.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1.5 }}>
          No available students
        </Typography>
      )}

      {!loading &&
        students.map((student) => {
          const isSelected = selectedStudentIds.includes(student.id);

          return (
            <Box
              key={student.id}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                px: 1.5,
                py: 0.5,
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleStudent(student.id)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">{student.username}</Typography>
                }
              />
            </Box>
          );
        })}
    </Box>
  );
}

StudentSelector.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedStudentIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onToggleStudent: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

StudentSelector.defaultProps = {
  loading: false,
};

export default StudentSelector;