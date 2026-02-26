import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function UpcomingPanel({ assignments }) {
  const overdueList = [];
  const upcomingList = [];

  if (assignments && assignments.length > 0) {
    assignments.forEach((a) => {
      const deadlineRaw = a.deadline || a.due;
      const relative = relativeDeadline(deadlineRaw);
      if (relative === "Overdue") {
        overdueList.push(a);
      } else {
        upcomingList.push(a);
      }
    });
  }

  const hasNothing = overdueList.length === 0 && upcomingList.length === 0;

  return (
    <div className="space-y-4">
      {/* Upcoming section */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
        <div className="border-b border-zinc-100 dark:border-zinc-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Upcoming
          </h3>
        </div>
        <div className="max-h-52 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {upcomingList.length > 0 ? (
            upcomingList.map((assignment) => {
              const deadlineRaw = assignment.deadline || assignment.due;
              const relative = relativeDeadline(deadlineRaw);
              return (
                <div
                  key={assignment.id}
                  className="border-l-2 border-violet-400 dark:border-violet-500 pl-3 py-1.5"
                >
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {assignment.title}
                  </p>
                  {assignment.className && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {assignment.className}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(deadlineRaw)}
                  </p>
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                    {relative}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No upcoming assignments
            </p>
          )}
        </div>
      </div>

      {/* Overdue section */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
        <div className="border-b border-zinc-100 dark:border-zinc-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Overdue
          </h3>
        </div>
        <div className="max-h-52 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {overdueList.length > 0 ? (
            overdueList.map((assignment) => {
              const deadlineRaw = assignment.deadline || assignment.due;
              return (
                <div
                  key={assignment.id}
                  className="border-l-2 border-red-400 dark:border-red-500 pl-3 py-1.5"
                >
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {assignment.title}
                  </p>
                  {assignment.className && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {assignment.className}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">
                    {formatDate(deadlineRaw)}
                  </p>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Overdue
                  </p>
                </div>
              );
            })
          ) : (
            <p className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No overdue assignments
            </p>
          )}
        </div>
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
