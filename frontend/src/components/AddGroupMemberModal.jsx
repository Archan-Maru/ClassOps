import { useState } from "react";
import api from "../api/api";

function AddGroupMemberModal({ isOpen, onClose, onSuccess, groupId, students, groupName, loadingStudents }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      setError("Please select a student");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post(`/groups/${groupId}/members`, {
        user_id: Number(selectedUserId),
      });
      setSelectedUserId("");
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100">Add Group Member</h2>
        <p className="mt-1 text-sm text-zinc-400">{groupName}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="member-user" className="block text-sm font-medium text-zinc-400">
              Available Students
            </label>
            <select
              id="member-user"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={loadingStudents || students.length === 0}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.username}
                </option>
              ))}
            </select>
            {loadingStudents && (
              <p className="mt-2 text-sm text-zinc-400">Loading available students...</p>
            )}
            {!loadingStudents && students.length === 0 && (
              <p className="mt-2 text-sm text-zinc-400">No available students to add</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingStudents || students.length === 0 || !selectedUserId}
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddGroupMemberModal.defaultProps = {
  students: [],
  groupName: "",
  loadingStudents: false,
};

export default AddGroupMemberModal;
