import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function AssignmentItem({ title, className, due }) {
  const relative = relativeDeadline(due);
  const isOverdue = relative === "Overdue";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 bg-white dark:bg-zinc-800 px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
        isOverdue
          ? "border-red-500"
          : "border-violet-600 dark:border-violet-500"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
        {className && (
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {className}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={`text-xs ${isOverdue ? "font-semibold text-red-600" : "text-zinc-400"}`}
          >
            {isOverdue ? "Overdue Â· " : ""}
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
