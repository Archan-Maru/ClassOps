import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function AssignmentCard({ id, classId, title, submissionType, deadline, status }) {
  const statusColor = status === "Submitted" ? "text-green-400" : "text-yellow-400";

  return (
    <Link
      to={`/classes/${classId}/assignments/${id}`}
      className="block rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-sm shadow-slate-950/20 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <div className="mt-2 flex gap-3">
            <span className="inline-block rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
              {submissionType}
            </span>
            {status && (
              <span className={`inline-block text-xs font-medium ${statusColor}`}>{status}</span>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-400">Due: {deadline}</p>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-indigo-400">View Assignment →</div>
    </Link>
  );
}

AssignmentCard.propTypes = {
  id: PropTypes.number.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  submissionType: PropTypes.oneOf(["INDIVIDUAL", "GROUP"]).isRequired,
  deadline: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["Pending", "Submitted"]),
};

AssignmentCard.defaultProps = {
  status: "",
};

export default AssignmentCard;
