import PropTypes from "prop-types";

function ClassHeader({ title, teacher, semester, classCode }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-linear-to-r from-indigo-900 to-slate-800 px-6 py-8 text-slate-100 shadow-lg shadow-slate-950/30">
      <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
      <p className="mt-2 text-sm text-slate-300">{teacher}</p>
      {semester && <p className="mt-1 text-xs text-slate-400">{semester}</p>}
      {classCode && (
        <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
            Class Code
          </span>
          <span className="rounded-md bg-slate-900/70 px-2 py-1 text-sm font-bold tracking-wider text-slate-100">
            {classCode}
          </span>
        </div>
      )}
    </div>
  );
}

ClassHeader.propTypes = {
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string.isRequired,
  semester: PropTypes.string,
  classCode: PropTypes.string,
};

ClassHeader.defaultProps = {
  semester: "",
  classCode: "",
};

export default ClassHeader;
