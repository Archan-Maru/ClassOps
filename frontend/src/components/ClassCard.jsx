import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function ClassCard({ id, title, teacher, meta }) {
  return (
    <Link
      to={`/classes/${id}`}
      className="group relative block overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/60 shadow-sm transition-all hover:border-indigo-500/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div className="h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-100">{title}</h3>
            {teacher && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-slate-500">
                  <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 00-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" />
                </svg>
                {teacher}
              </p>
            )}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-indigo-400">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </div>
        {meta && <p className="mt-3 text-xs text-slate-500">{meta}</p>}
      </div>
    </Link>
  );
}

ClassCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string.isRequired,
  meta: PropTypes.string,
};

ClassCard.defaultProps = {
  meta: "",
};

export default ClassCard;
