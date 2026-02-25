import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function UpcomingPanel({ assignments }) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="text-lg font-semibold text-slate-100">Upcoming</h3>
        <p className="mt-4 text-sm text-slate-400">No upcoming assignments</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="text-lg font-semibold text-slate-100">Upcoming</h3>
      <div className="mt-4 space-y-3">
        {assignments.map((assignment) => {
          const deadlineRaw = assignment.deadline || assignment.due;
          const relative = relativeDeadline(deadlineRaw);
          const isOverdue = relative === "Overdue";

          return (
            <div
              key={assignment.id}
              className={`border-l-2 ${
                isOverdue ? "border-red-500" : "border-indigo-500"
              } bg-slate-900/40 px-3 py-2`}
            >
              <p className="text-sm font-medium text-slate-100">{assignment.title}</p>
              <p className={`mt-1 text-xs ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                {formatDate(deadlineRaw)}
              </p>
              <p className={`text-xs font-medium ${isOverdue ? "text-red-400" : "text-indigo-300"}`}>
                {relative}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

UpcomingPanel.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default UpcomingPanel;
