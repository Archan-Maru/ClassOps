import PropTypes from "prop-types";

function UpcomingPanel({ assignments }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="text-lg font-semibold text-slate-100">Upcoming</h3>
      <div className="mt-4 space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border-l-2 border-indigo-500 bg-slate-900/40 px-3 py-2">
            <p className="text-sm font-medium text-slate-100">{assignment.title}</p>
            <p className="mt-1 text-xs text-slate-400">Due: {assignment.due}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

UpcomingPanel.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      due: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default UpcomingPanel;
