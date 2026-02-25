import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function AssignmentItem({ title, className, due }) {
  const relative = relativeDeadline(due);
  const isOverdue = relative === "Overdue";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 bg-white dark:bg-slate-800 px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
        isOverdue
          ? "border-red-500"
          : "border-indigo-600 dark:border-indigo-500"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </p>
        {className && (
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {className}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={`text-xs ${isOverdue ? "font-semibold text-red-600" : "text-slate-400"}`}
          >
            {isOverdue ? "Overdue · " : ""}
            {formatDate(due)}
          </span>
        </div>
      </div>
    </div>
  );
}

AssignmentItem.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  due: PropTypes.string,
};

AssignmentItem.defaultProps = {
  className: "",
  due: "",
};

export default AssignmentItem;
