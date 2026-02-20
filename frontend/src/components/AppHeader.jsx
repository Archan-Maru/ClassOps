import { useNavigate } from "react-router-dom";

function AppHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-700 bg-slate-900 shadow">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-xl font-semibold text-slate-100">ClassOps</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
