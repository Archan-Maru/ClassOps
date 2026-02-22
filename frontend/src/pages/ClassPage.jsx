import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 text-slate-100"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
      <span>Home</span>
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

function ClassPage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("classwork");
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

  const upcomingAssignments = assignments.slice(0, 2);
  const isTeacher = userRole === "TEACHER";

  const handleAddMember = (group) => {
    setActiveGroup(group);
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

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {loading && <p className="text-slate-400">Loading class...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && classData && (
            <>
              {/* Back link under the app header (goes to dashboard which lists classes) */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-400"
                >
                  <span className="text-lg">←</span>
                  <span className="text-sm">Back to classes</span>
                </button>
              </div>

              <ClassHeader
                title={classData.title}
                teacher={classData.teacher}
                semester={classData.semester}
                classCode={isTeacher ? classData.code : ""}
              />

              <div className="mt-6 border-b border-slate-700">
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("classwork")}
                    className={`px-4 py-3 font-medium ${
                      activeTab === "classwork"
                        ? "border-b-2 border-indigo-500 text-slate-100"
                        : "text-slate-400"
                    }`}
                  >
                    Classwork
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("assignments")}
                    className={`px-4 py-3 font-medium ${
                      activeTab === "assignments"
                        ? "border-b-2 border-indigo-500 text-slate-100"
                        : "text-slate-400"
                    }`}
                  >
                    Assignments
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("people")}
                    className={`px-4 py-3 font-medium ${
                      activeTab === "people"
                        ? "border-b-2 border-indigo-500 text-slate-100"
                        : "text-slate-400"
                    }`}
                  >
                    People
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("groups")}
                    className={`px-4 py-3 font-medium ${
                      activeTab === "groups"
                        ? "border-b-2 border-indigo-500 text-slate-100"
                        : "text-slate-400"
                    }`}
                  >
                    Groups
                  </button>
                </div>
              </div>

              {activeTab === "classwork" && (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    {isTeacher && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCreateClassworkOpen(true)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                        >
                          + Add Material
                        </button>
                      </div>
                    )}
                    {classwork.length > 0 ? (
                      classwork.map((item) => (
                        <ClassworkCard
                          key={item.id}
                          title={item.title}
                          description={item.description}
                          resourceUrl={item.resource_url}
                          createdAt={item.created_at}
                        />
                      ))
                    ) : (
                      <p className="text-slate-400">
                        No classwork materials yet
                      </p>
                    )}
                  </div>

                  <div>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    {isTeacher && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCreateAssignmentOpen(true)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
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
                        />
                      ))
                    ) : (
                      <p className="text-slate-400">No assignments yet</p>
                    )}
                  </div>

                  <div>
                    <UpcomingPanel assignments={upcomingAssignments} />
                  </div>
                </div>
              )}

              {activeTab === "people" && (
                <div className="mt-6">
                  <PeopleList people={people} />
                </div>
              )}

              {activeTab === "groups" && (
                <div className="mt-6 space-y-4">
                  {isTeacher && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsCreateGroupOpen(true)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
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
                    <p className="text-slate-400">
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
