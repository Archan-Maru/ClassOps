import PropTypes from "prop-types";

function StudentSelector({ students, selectedStudentIds, onToggleStudent, loading }) {
  return (
    <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/60">
      {loading && <p className="px-3 py-3 text-sm text-slate-400">Loading students...</p>}

      {!loading && students.length === 0 && (
        <p className="px-3 py-3 text-sm text-slate-400">No available students</p>
      )}

      {!loading &&
        students.map((student) => {
          const isSelected = selectedStudentIds.includes(student.id);

          return (
            <label
              key={student.id}
              htmlFor={`student-${student.id}`}
              className="flex cursor-pointer items-center gap-3 border-b border-slate-700/60 px-3 py-2 last:border-b-0"
            >
              <input
                id={`student-${student.id}`}
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleStudent(student.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500"
              />
              <span className="text-sm text-slate-200">{student.username}</span>
            </label>
          );
        })}
    </div>
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
