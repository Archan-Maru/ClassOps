import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import SchoolIcon from "@mui/icons-material/School";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import JoinClassModal from "../components/JoinClassModal";
import UpcomingPanel from "../components/UpcomingPanel";
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
      setUpcomingAssignments(allAssignments);
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

      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Box
          sx={{
            maxWidth: "80rem",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 4,
              alignItems: { lg: "flex-start" },
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  My Classes
                </Typography>
                {!loading && userRole && (
                  <Button
                    variant="contained"
                    onClick={() =>
                      userRole === "TEACHER"
                        ? setIsCreateOpen(true)
                        : setIsJoinOpen(true)
                    }
                  >
                    {userRole === "TEACHER" ? "+ Create Class" : "+ Join Class"}
                  </Button>
                )}
              </Box>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress size={28} />
                </Box>
              )}
              {error && (
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  {error}
                </Typography>
              )}

              {!loading && classes.length === 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 4,
                    py: 10,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      height: 56,
                      width: 56,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      bgcolor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(124,58,237,0.12)"
                          : "rgba(124,58,237,0.08)",
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 28, color: "primary.light" }} />
                  </Box>
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    No classes yet
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.75, maxWidth: 280, color: "text.secondary" }}
                  >
                    {userRole === "TEACHER"
                      ? "Create your first class to get started."
                      : "Ask your teacher for a class code, then join above."}
                  </Typography>
                </Paper>
              )}

              {!loading && classes.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2.5,
                    gridTemplateColumns: {
                      sm: "1fr 1fr",
                      xl: "1fr 1fr 1fr",
                    },
                  }}
                >
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
                </Box>
              )}
            </Box>

            <Box
              component="aside"
              sx={{
                width: { xs: "100%", lg: 256, xl: 288 },
                flexShrink: 0,
              }}
            >
              <UpcomingPanel assignments={upcomingAssignments} />
            </Box>
          </Box>
        </Box>
      </Box>

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
