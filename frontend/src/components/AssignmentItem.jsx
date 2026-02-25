import PropTypes from "prop-types";
import { formatDate, relativeDeadline } from "../utils/formatDate";

function AssignmentItem({ title, className, due }) {
  const relative = relativeDeadline(due);
  const isOverdue = relative === "Overdue";

  return (
    <div className={`flex items-start gap-3 rounded-lg border ${
      isOverdue ? "border-red-700/40 bg-red-950/20" : "border-slate-700/50 bg-slate-800/50"
    } p-3 transition-colors hover:bg-slate-800/80`}>
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        isOverdue ? "bg-red-500/15 text-red-400" : "bg-indigo-500/15 text-indigo-400"
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-slate-100">{title}</h3>
        {className && <p className="mt-0.5 truncate text-xs text-slate-400">{className}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`text-xs ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
            {formatDate(due)}
          </span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            isOverdue
              ? "bg-red-500/15 text-red-400"
              : "bg-indigo-500/15 text-indigo-300"
          }`}>
            {relative}
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
