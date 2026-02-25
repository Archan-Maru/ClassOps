import { useState } from "react";
import PropTypes from "prop-types";

function ClassHeader({ title, teacher, semester, classCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(classCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {teacher}
      </p>
      {semester && (
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          {semester}
        </p>
      )}
      {classCode && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            Class Code
          </span>
          <span className="rounded-md bg-white dark:bg-slate-700 px-2 py-0.5 text-sm font-bold tracking-wider text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-700">
            {classCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy class code"
            className="ml-1 rounded-md p-1 text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-green-500"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
            )}
          </button>
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
