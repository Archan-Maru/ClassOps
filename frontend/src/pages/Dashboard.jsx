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
      
      // Fetch assignments for each class
      const allAssignments = [];
      for (const cls of classList) {
        try {
          const assignmentsRes = await api.get(`/classes/${cls.id}/assignments`);
          const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : assignmentsRes.data?.assignments || [];
          allAssignments.push(...assignments.map(a => ({ ...a, classId: cls.id, className: cls.name })));
        } catch (err) {
          console.error(`Failed to fetch assignments for class ${cls.id}:`, err);
        }
      }
      
      // Sort by due date and take first 5
      allAssignments.sort((a, b) => new Date(a.due) - new Date(b.due));
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
        
        // Try to fetch user profile to get role
        try {
          const userRes = await api.get("/auth/me");
          const role = userRes.data?.user?.role || "STUDENT";
          setUserRole(role);
          console.log("User role:", role);
        } catch (err) {
          console.warn("Could not fetch user role:", err);
          setUserRole("STUDENT"); // Default to STUDENT if fetch fails
        }
        
        // Fetch classes
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
              <h2 className="text-lg font-semibold text-slate-100">Upcoming Assignments</h2>
              <div className="mt-4 space-y-3">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment) => (
                    <AssignmentItem
                      key={assignment.id}
                      title={assignment.title}
                      className={assignment.class}
                      due={assignment.due}
                    />
                  ))
                ) : (
                  <p className="text-slate-400">No upcoming assignments</p>
                )}
              </div>
            </aside>

            <main className="flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">My Classes</h2>
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
              {!loading && classes.length === 0 && <p className="mt-4 text-slate-400">No classes found</p>}
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
