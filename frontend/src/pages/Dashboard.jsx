import { useState, useEffect } from "react";
import AssignmentItem from "../components/AssignmentItem";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import JoinClassModal from "../components/JoinClassModal";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

function Dashboard() {
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
      const classList = Array.isArray(classesRes.data)
        ? classesRes.data
        : classesRes.data?.classes || [];
      setClasses(classList);

      const allAssignments = [];
      for (const cls of classList) {
        try {
          const assignmentsRes = await api.get(
            `/classes/${cls.id}/assignments`,
          );
          const assignments = Array.isArray(assignmentsRes.data)
            ? assignmentsRes.data
            : assignmentsRes.data?.assignments || [];
          allAssignments.push(
            ...assignments.map((a) => ({
              ...a,
              classId: cls.id,
              className: cls.title || cls.name,
            })),
          );
        } catch (err) {
          console.error(
            `Failed to fetch assignments for class ${cls.id}:`,
            err,
          );
        }
      }

      allAssignments.sort(
        (a, b) => new Date(a.deadline) - new Date(b.deadline),
      );
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

  const handleUnenroll = async (classId) => {
    try {
      await api.delete(`/classes/${classId}/enroll`);
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave class");
    }
  };

  return (
    <>
      <AppHeader />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* ── Two-column shell: main + right sidebar ── */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ══ Main column ══ */}
            <div className="min-w-0 flex-1">
              {/* Section header row */}
              <div className="mb-5 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  My Classes
                </h1>
                {!loading && userRole && (
                  <button
                    type="button"
                    onClick={() =>
                      userRole === "TEACHER"
                        ? setIsCreateOpen(true)
                        : setIsJoinOpen(true)
                    }
                    className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:hover:bg-indigo-600 active:bg-indigo-800"
                  >
                    {userRole === "TEACHER" ? "+ Create Class" : "+ Join Class"}
                  </button>
                )}
              </div>

              {/* States */}
              {loading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading classes…
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              {/* Empty state */}
              {!loading && classes.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-7 w-7 text-indigo-400"
                    >
                      <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                      <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                    No classes yet
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                    {userRole === "TEACHER"
                      ? "Create your first class to get started."
                      : "Ask your teacher for a class code, then join above."}
                  </p>
                </div>
              )}

              {/* Class tiles grid */}
              {!loading && classes.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {classes.map((classItem) => (
                    <ClassCard
                      key={classItem.id}
                      id={classItem.id}
                      title={classItem.title}
                      teacher={classItem.teacher_name}
                      meta={classItem.meta}
                      userRole={userRole}
                      onUnenroll={handleUnenroll}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ══ Right sidebar – Upcoming ══ */}
            <aside className="w-full shrink-0 lg:w-64 xl:w-72">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                {/* Header */}
                <div className="border-b border-slate-100 dark:border-slate-700 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Upcoming
                  </h2>
                </div>

                {/* List */}
                <div className="space-y-2 p-4">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-slate-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        All caught up
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        No upcoming deadlines
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
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
    </>
  );
}

export default Dashboard;
