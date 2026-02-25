import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function UpcomingPanel({ assignments }) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Upcoming
        </h3>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No upcoming assignments
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Upcoming
      </h3>
      <div className="mt-4 space-y-3">
        {assignments.map((assignment) => {
          const deadlineRaw = assignment.deadline || assignment.due;
          const relative = relativeDeadline(deadlineRaw);
          const isOverdue = relative === "Overdue";

          return (
            <div
              key={assignment.id}
              className={`border-l-2 pl-3 py-1.5 ${
                isOverdue
                  ? "border-red-400 dark:border-red-500"
                  : "border-indigo-400 dark:border-indigo-500"
              }`}
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {assignment.title}
              </p>
              <p
                className={`mt-0.5 text-xs ${isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}
              >
                {formatDate(deadlineRaw)}
              </p>
              <p
                className={`text-xs font-medium ${isOverdue ? "text-red-500 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"}`}
              >
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
    }),
  ).isRequired,
};

export default UpcomingPanel;
