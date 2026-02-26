import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";

function AuthLayout({ title, subtitle, children, footer }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* â”€â”€ Left panel â€“ branding â”€â”€ */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-center px-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700">
        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-violet-600 dark:bg-violet-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            ClassOps
          </span>
        </div>

        {/* Tagline */}
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-4">
          All your classes.
          <br />
          One simple platform.
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-xs">
          Manage assignments, submissions, and grades â€” all in one calm,
          organised space.
        </p>
      </div>

      {/* â”€â”€ Right panel â€“ form â”€â”€ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-zinc-50 dark:bg-zinc-950">
        {/* Theme toggle â€” top right */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-violet-600 dark:bg-violet-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            ClassOps
          </span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footer && (
            <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

export default AuthLayout;
