import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentItem from "../components/AssignmentItem";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import JoinClassModal from "../components/JoinClassModal";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const classesRes = await api.get("/classes/me");
      const classList = Array.isArray(classesRes.data) ? classesRes.data : classesRes.data?.classes || [];
      setClasses(classList);
      
      const allAssignments = [];
      for (const cls of classList) {
        try {
          const assignmentsRes = await api.get(`/classes/${cls.id}/assignments`);
          const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : assignmentsRes.data?.assignments || [];
          allAssignments.push(...assignments.map(a => ({ ...a, classId: cls.id, className: cls.title || cls.name })));
        } catch (err) {
          console.error(`Failed to fetch assignments for class ${cls.id}:`, err);
        }
      }
      
      allAssignments.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setUpcomingAssignments(allAssignments.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
      console.error("Classes fetch error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          const userRes = await api.get("/auth/me");
          const role = userRes.data?.user?.role || "STUDENT";
          setUserRole(role);
        } catch (err) {
          console.warn("Could not fetch user role:", err);
          setUserRole("STUDENT");
        }
        
        await fetchClasses();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex w-full flex-col gap-6 lg:flex-row">
            <aside className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 lg:w-80 lg:shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-indigo-400">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Upcoming</h2>
              </div>
              <div className="mt-4 space-y-2">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment) => (
                    <AssignmentItem
                      key={assignment.id}
                      title={assignment.title}
                      className={assignment.className || ""}
                      due={assignment.deadline}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-600">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </aside>

            <main className="flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-400">
                      <path d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">My Classes</h2>
                </div>
                {!loading && userRole && (
                  <button
                    type="button"
                    onClick={() => (userRole === "TEACHER" ? setIsCreateOpen(true) : setIsJoinOpen(true))}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    {userRole === "TEACHER" ? "+ Create Class" : "+ Join Class"}
                  </button>
                )}
              </div>
              {loading && <p className="mt-4 text-slate-400">Loading classes...</p>}
              {error && <p className="mt-4 text-red-400">{error}</p>}
              {!loading && classes.length === 0 && (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-slate-600">
                      <path d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-400">No classes yet</p>
                  <p className="mt-1 text-xs text-slate-500">{userRole === "TEACHER" ? "Create your first class to get started" : "Join a class using a code from your teacher"}</p>
                </div>
              )}
              {!loading && classes.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {classes.map((classItem) => (
                    <ClassCard
                      key={classItem.id}
                      id={classItem.id}
                      title={classItem.title}
                      teacher={classItem.teacher}
                      meta={classItem.meta}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        <CreateClassModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchClasses();
          }}
        />
        <JoinClassModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onSuccess={() => {
            setIsJoinOpen(false);
            fetchClasses();
          }}
        />
      </div>
    </>
  );
}

export default Dashboard;
