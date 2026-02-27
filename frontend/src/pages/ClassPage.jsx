import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import ClassHeader from "../components/ClassHeader";
import ClassworkCard from "../components/ClassworkCard";
import AssignmentCard from "../components/AssignmentCard";
import UpcomingPanel from "../components/UpcomingPanel";
import CreateAssignmentModal from "../components/CreateAssignmentModal";
import CreateClassworkModal from "../components/CreateClassworkModal";
import CreateGroupModal from "../components/CreateGroupModal";
import AddGroupMemberModal from "../components/AddGroupMemberModal";
import PeopleList from "../components/PeopleList";
import InviteStudentsModal from "../components/InviteStudentsModal";
import GroupCard from "../components/GroupCard";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

const resolveClassCode = (classInfo) => {
  const apiCode =
    classInfo?.class_code ||
    classInfo?.classCode ||
    classInfo?.code ||
    classInfo?.join_code ||
    "";

  if (apiCode) {
    return String(apiCode).toUpperCase();
  }

  if (classInfo?.id !== undefined && classInfo?.id !== null) {
    return `CLASS-${String(classInfo.id).toUpperCase()}`;
  }

  return "";
};

const VALID_TABS = ["classwork", "assignments", "people", "groups"];

function ClassPage() {
  const { id: classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "classwork";

  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classwork, setClasswork] = useState([]);
  const [people, setPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingAvailableStudents, setLoadingAvailableStudents] =
    useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isCreateClassworkOpen, setIsCreateClassworkOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const refreshClassDetails = async () => {
    const classRes = await api.get(`/classes/${classId}`);
    const classInfo = classRes.data?.class || null;
    if (classInfo) {
      setClassData({
        title: classInfo.title,
        teacher: classInfo.teacher_name,
        semester: "Current",
        code: resolveClassCode(classInfo),
      });
    }
  };

  const refreshAssignments = async () => {
    const res = await api.get(`/classes/${classId}/assignments`);
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.assignments || [];
    setAssignments(list);
  };

  const refreshClasswork = async () => {
    try {
      const res = await api.get(`/classes/${classId}/classwork`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.classwork || [];
      setClasswork(list);
    } catch (err) {
      console.warn("Failed to load classwork:", err);
      setClasswork([]);
    }
  };

  const refreshPeople = async () => {
    const res = await api.get(`/classes/${classId}/people`);
    const list = Array.isArray(res.data) ? res.data : res.data?.people || [];
    setPeople(list);
  };

  const refreshGroups = async () => {
    const res = await api.get(`/classes/${classId}/groups`);
    const list = Array.isArray(res.data) ? res.data : res.data?.groups || [];

    const groupsWithMembers = await Promise.all(
      list.map(async (group) => {
        try {
          const membersRes = await api.get(
            `/classes/groups/${group.id}/members`,
          );
          const members = Array.isArray(membersRes.data)
            ? membersRes.data
            : membersRes.data?.members || [];
          return { ...group, members };
        } catch (err) {
          return { ...group, members: [] };
        }
      }),
    );

    setGroups(groupsWithMembers);
  };

  const refreshAvailableStudents = async (roleOverride) => {
    const effectiveRole = roleOverride || userRole;
    if (effectiveRole !== "TEACHER") {
      setAvailableStudents([]);
      return;
    }

    try {
      setLoadingAvailableStudents(true);
      const res = await api.get(`/classes/${classId}/available-students`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.students || [];
      setAvailableStudents(list);
    } catch (err) {
      console.warn("Failed to load available students:", err);
      setAvailableStudents([]);
    } finally {
      setLoadingAvailableStudents(false);
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);

        const userRes = await api.get("/auth/me");
        const role = userRes.data?.user?.role || "";
        setUserRole(role);
        setCurrentUserId(userRes.data?.user?.id || null);

        await refreshClassDetails();
        await refreshAssignments();
        await refreshClasswork();
        await refreshPeople();
        await refreshGroups();
        if (role === "TEACHER") {
          await refreshAvailableStudents(role);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load class data");
        console.error("ClassPage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  useEffect(() => {
    if (isCreateGroupOpen) {
      refreshAvailableStudents();
    }
  }, [isCreateGroupOpen]);

  useEffect(() => {
    if (activeGroup) {
      refreshAvailableStudents();
    }
  }, [activeGroup]);

  const upcomingAssignments = [...assignments]
    .filter((a) => a.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const isTeacher = userRole === "TEACHER";

  const handleAddMember = (group) => {
    setActiveGroup(group);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await api.delete(`/assignments/${assignmentId}`);
      await refreshAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  const handleDeleteClasswork = async (classworkId) => {
    try {
      await api.delete(`/classes/${classId}/classwork/${classworkId}`);
      await refreshClasswork();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete classwork");
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      await refreshGroups();
      await refreshAvailableStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleAssignLeader = async (groupId, memberId) => {
    try {
      await api.post(`/groups/${groupId}/leader`, {
        user_id: memberId,
      });
      await refreshGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign leader");
    }
  };

  const visibleGroups = isTeacher
    ? groups
    : groups.filter((group) =>
        group.members?.some((member) => member.id === currentUserId),
      );

  const TABS = [
    { key: "classwork", label: "Classwork" },
    { key: "assignments", label: "Assignments" },
    { key: "people", label: "People" },
    { key: "groups", label: "Groups" },
  ];

  const tabIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <>
      <AppHeader breadcrumb={classData?.title || ""} />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Box
          sx={{
            maxWidth: "72rem",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            py: 3,
          }}
        >
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {!loading && classData && (
            <>
              {/* Class header */}
              <ClassHeader
                title={classData.title}
                teacher={classData.teacher}
                semester={classData.semester}
                classCode={isTeacher ? classData.code : ""}
              />

              {/* Tabs */}
              <Box sx={{ mt: 3, borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabIndex >= 0 ? tabIndex : 0}
                  onChange={(_, v) => setActiveTab(TABS[v].key)}
                  centered
                  textColor="primary"
                  indicatorColor="primary"
                >
                  {TABS.map((tab) => (
                    <Tab
                      key={tab.key}
                      label={tab.label}
                      disableRipple
                      sx={{ textTransform: "none", fontWeight: 500 }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Classwork tab */}
              {activeTab === "classwork" && (
                <Box
                  sx={{
                    mt: 3,
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: { lg: "1fr 1fr 1fr" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      gridColumn: { lg: "span 2" },
                    }}
                  >
                    {isTeacher && (
                      <Box
                        sx={{ display: "flex", justifyContent: "flex-start" }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setIsCreateClassworkOpen(true)}
                        >
                          New Announcement
                        </Button>
                      </Box>
                    )}
                    {classwork.length > 0 ? (
                      classwork.map((item) => (
                        <ClassworkCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          description={item.description}
                          resourceUrl={item.resource_url}
                          createdAt={item.created_at}
                          isTeacher={isTeacher}
                          onDelete={handleDeleteClasswork}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        No classwork materials yet
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </Box>
                </Box>
              )}

              {/* Assignments tab */}
              {activeTab === "assignments" && (
                <Box
                  sx={{
                    mt: 3,
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: { lg: "1fr 1fr 1fr" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      gridColumn: { lg: "span 2" },
                    }}
                  >
                    {isTeacher && (
                      <Box
                        sx={{ display: "flex", justifyContent: "flex-start" }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => setIsCreateAssignmentOpen(true)}
                        >
                          + Create Assignment
                        </Button>
                      </Box>
                    )}
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          id={assignment.id}
                          classId={classId}
                          title={assignment.title}
                          submissionType={assignment.submission_type}
                          deadline={assignment.deadline}
                          status={assignment.status || ""}
                          isTeacher={isTeacher}
                          onDelete={handleDeleteAssignment}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        No assignments yet
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </Box>
                </Box>
              )}

              {/* People tab */}
              {activeTab === "people" && (
                <Box sx={{ mt: 3 }}>
                  {isTeacher && (
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<EmailIcon />}
                        onClick={() => setIsInviteOpen(true)}
                      >
                        Invite Students
                      </Button>
                    </Box>
                  )}
                  <PeopleList people={people} />
                </Box>
              )}

              {/* Groups tab */}
              {activeTab === "groups" && (
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {isTeacher && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Button
                        variant="contained"
                        onClick={() => setIsCreateGroupOpen(true)}
                      >
                        + Create Group
                      </Button>
                    </Box>
                  )}
                  {visibleGroups.length > 0 ? (
                    visibleGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        isTeacher={isTeacher}
                        onAddMember={handleAddMember}
                        onRemoveMember={handleRemoveMember}
                        onAssignLeader={handleAssignLeader}
                      />
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {isTeacher
                        ? "No groups yet"
                        : "You are not assigned to a group yet"}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        onSuccess={() => {
          setIsCreateAssignmentOpen(false);
          refreshAssignments();
        }}
        classId={classId}
      />
      <CreateClassworkModal
        isOpen={isCreateClassworkOpen}
        onClose={() => setIsCreateClassworkOpen(false)}
        onSuccess={() => {
          setIsCreateClassworkOpen(false);
          refreshClasswork();
        }}
        classId={classId}
      />
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={() => {
          setIsCreateGroupOpen(false);
          refreshGroups();
          refreshAvailableStudents();
        }}
        classId={classId}
        students={availableStudents}
        loadingStudents={loadingAvailableStudents}
      />
      <AddGroupMemberModal
        isOpen={Boolean(activeGroup)}
        onClose={() => setActiveGroup(null)}
        onSuccess={async () => {
          setActiveGroup(null);
          await refreshGroups();
          await refreshAvailableStudents();
        }}
        groupId={activeGroup?.id}
        groupName={activeGroup?.name}
        students={availableStudents}
        loadingStudents={loadingAvailableStudents}
      />
      <InviteStudentsModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        classId={classId}
      />
    </>
  );
}

export default ClassPage;
