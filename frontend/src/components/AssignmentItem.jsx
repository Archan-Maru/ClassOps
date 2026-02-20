import PropTypes from "prop-types";

function AssignmentItem({ title, className, due }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-sm shadow-slate-950/20">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs text-slate-300">{className}</p>
      <p className="mt-2 text-xs text-indigo-300">Due: {due}</p>
    </div>
  );
}

AssignmentItem.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  due: PropTypes.string.isRequired,
};

export default AssignmentItem;
