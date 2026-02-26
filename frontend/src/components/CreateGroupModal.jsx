import { useEffect, useState } from "react";
import api from "../api/api";
import StudentSelector from "./StudentSelector";

function CreateGroupModal({ isOpen, onClose, onSuccess, classId, students, loadingStudents }) {
  const [groupName, setGroupName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [leaderId, setLeaderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedStudentIds([]);
      setLeaderId("");
      setError(null);
    }
  }, [isOpen]);

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        const next = prev.filter((id) => id !== studentId);
        if (Number(leaderId) === studentId) {
          setLeaderId("");
        }
        return next;
      }
      return [...prev, studentId];
    });
  };

  const handleClose = () => {
    if (loading) {
      return;
    }
    onClose();
  };

  const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.id));
  const isSubmitDisabled =
    loading ||
    !groupName.trim() ||
    selectedStudentIds.length === 0 ||
    !leaderId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedStudentIds.length === 0) {
      setError("Select at least one student");
      return;
    }

    if (!leaderId) {
      setError("Select a group leader");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createRes = await api.post(`/classes/${classId}/groups`, {
        name: groupName.trim(),
      });

      const groupId = createRes.data?.group?.id;
      if (!groupId) {
        throw new Error("Failed to create group");
      }

      for (const studentId of selectedStudentIds) {
        await api.post(`/groups/${groupId}/members`, {
          user_id: studentId,
          role: Number(leaderId) === studentId ? "LEADER" : "MEMBER",
        });
      }

      await api.post(`/groups/${groupId}/leader`, {
        user_id: Number(leaderId),
      });

      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100">Create Group</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-zinc-400">
              Group Name
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-zinc-400">Students not in any group</p>
            <StudentSelector
              students={students}
              selectedStudentIds={selectedStudentIds}
              onToggleStudent={handleToggleStudent}
              loading={loadingStudents}
            />
            {!loadingStudents && students.length > 0 && (
              <p className="mt-2 text-xs text-zinc-400">
                Selected: {selectedStudentIds.length}
              </p>
            )}
          </div>

          {selectedStudents.length > 0 && (
            <div>
              <label htmlFor="group-leader" className="block text-sm font-medium text-zinc-400">
                Group Leader
              </label>
              <select
                id="group-leader"
                value={leaderId}
                onChange={(event) => setLeaderId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="">Select leader</option>
                {selectedStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;
