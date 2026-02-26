import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function ClassCard({ id, title, teacher, meta, userRole, onUnenroll }) {
  const initial = (title || "?")[0].toUpperCase();

  const handleUnenroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(`Leave "${title}"? You will need a class code to rejoin.`)
    ) {
      onUnenroll(id);
    }
  };

  return (
    <Link
      to={`/classes/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
    >
      {/* â”€â”€ Header band â”€â”€ */}
      <div className="relative flex h-28 flex-col justify-end bg-violet-600 dark:bg-violet-500 p-4">
        {/* Class title */}
        <h3 className="w-full truncate text-lg font-bold leading-tight text-white">
          {title}
        </h3>
        {/* Teacher name â€“ just below title */}
        {teacher && (
          <p className="mt-0.5 truncate text-sm text-violet-200">{teacher}</p>
        )}
        {/* Initial avatar â€“ bottom-right, overlapping body */}
        <div className="absolute bottom-0 right-4 tranzinc-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white dark:border-zinc-800 bg-white dark:bg-zinc-800 shadow-sm">
          <span className="text-base font-bold text-violet-600 dark:text-violet-400">
            {initial}
          </span>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div className="flex flex-1 items-end justify-between px-4 pb-3 pt-6">
        {userRole === "STUDENT" ? (
          <button
            type="button"
            onClick={handleUnenroll}
            className="shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-600 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition hover:border-red-200 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            Leave
          </button>
        ) : (
          <span />
        )}
        {meta && <p className="ml-2 truncate text-xs text-zinc-400">{meta}</p>}
      </div>
    </Link>
  );
}

ClassCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string,
  meta: PropTypes.string,
  userRole: PropTypes.string,
  onUnenroll: PropTypes.func,
};

ClassCard.defaultProps = {
  teacher: "",
  meta: "",
  userRole: null,
  onUnenroll: () => {},
};

export default ClassCard;
