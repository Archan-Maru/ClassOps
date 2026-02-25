import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ClassHeader from "../components/ClassHeader";
import ClassworkCard from "../components/ClassworkCard";
import AssignmentCard from "../components/AssignmentCard";
import UpcomingPanel from "../components/UpcomingPanel";
import CreateAssignmentModal from "../components/CreateAssignmentModal";
import CreateClassworkModal from "../components/CreateClassworkModal";
import CreateGroupModal from "../components/CreateGroupModal";
import AddGroupMemberModal from "../components/AddGroupMemberModal";
import PeopleList from "../components/PeopleList";
import GroupCard from "../components/GroupCard";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

function BackToClassesLink() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clipRule="evenodd"
        />
      </svg>
      <span>Back to classes</span>
    </button>
  );
}

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
  const navigate = useNavigate();
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
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
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

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {loading && (
            <p className="text-slate-500 dark:text-slate-400">Loading class…</p>
          )}
          {error && (
            <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {!loading && classData && (
            <>
              {/* Back link */}
              <div className="mb-5">
                <BackToClassesLink />
              </div>

              {/* Class header */}
              <ClassHeader
                title={classData.title}
                teacher={classData.teacher}
                semester={classData.semester}
                classCode={isTeacher ? classData.code : ""}
              />

              {/* Tabs */}
              <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex justify-center gap-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-5 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                          : "border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Classwork tab */}
              {activeTab === "classwork" && (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-2">
                    {isTeacher && (
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setIsCreateClassworkOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          New Announcement
                        </button>
                      </div>
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
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No classwork materials yet
                      </p>
                    )}
                  </div>
                  <div>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </div>
                </div>
              )}

              {/* Assignments tab */}
              {activeTab === "assignments" && (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-2">
                    {isTeacher && (
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setIsCreateAssignmentOpen(true)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          + Create Assignment
                        </button>
                      </div>
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
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No assignments yet
                      </p>
                    )}
                  </div>
                  <div>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </div>
                </div>
              )}

              {/* People tab */}
              {activeTab === "people" && (
                <div className="mt-6">
                  <PeopleList people={people} />
                </div>
              )}

              {/* Groups tab */}
              {activeTab === "groups" && (
                <div className="mt-6 space-y-4">
                  {isTeacher && (
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={() => setIsCreateGroupOpen(true)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        + Create Group
                      </button>
                    </div>
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isTeacher
                        ? "No groups yet"
                        : "You are not assigned to a group yet"}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
    </>
  );
}

export default ClassPage;
