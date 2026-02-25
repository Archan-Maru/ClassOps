import PropTypes from "prop-types";
import { useMemo, useState } from "react";

function GroupCard({
  group,
  isTeacher,
  onAddMember,
  onRemoveMember,
  onAssignLeader,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRemovePicker, setShowRemovePicker] = useState(false);
  const [showLeaderPicker, setShowLeaderPicker] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");

  const normalizedMembers = useMemo(
    () =>
      (group.members || []).map((member) => ({
        ...member,
        normalizedRole: String(member.role || "").toUpperCase(),
      })),
    [group.members],
  );

  const leader = normalizedMembers.find(
    (member) => member.normalizedRole === "LEADER",
  );
  const removableMembers = normalizedMembers.filter(
    (member) => member.normalizedRole !== "LEADER",
  );

  const toggleCard = () => {
    setIsExpanded((prev) => !prev);
    setShowRemovePicker(false);
    setShowLeaderPicker(false);
    setSelectedMemberId("");
    setSelectedLeaderId("");
  };

  const handleRemoveSubmit = () => {
    if (!selectedMemberId) {
      return;
    }
    onRemoveMember(group.id, Number(selectedMemberId));
    setShowRemovePicker(false);
    setSelectedMemberId("");
  };

  const handleAssignLeaderSubmit = () => {
    if (!selectedLeaderId) {
      return;
    }
    onAssignLeader(group.id, Number(selectedLeaderId));
    setShowLeaderPicker(false);
    setSelectedLeaderId("");
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <button type="button" onClick={toggleCard} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {group.name}
          </h3>
          {isTeacher && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddMember(group);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddMember(group);
                  }
                }}
                className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Add Member
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowRemovePicker((prev) => !prev);
                  setShowLeaderPicker(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowRemovePicker((prev) => !prev);
                    setShowLeaderPicker(false);
                  }
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Remove Member
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowLeaderPicker((prev) => !prev);
                  setShowRemovePicker(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowLeaderPicker((prev) => !prev);
                    setShowRemovePicker(false);
                  }
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Assign Leader
              </span>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Leader:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {leader?.username || "Not assigned"}
          </span>
        </p>
      </button>

      {isTeacher && showRemovePicker && (
        <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Remove a member
          </p>
          <div className="mt-2 flex gap-2">
            <select
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(event.target.value)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select member</option>
              {removableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRemoveSubmit}
              disabled={!selectedMemberId}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {isTeacher && showLeaderPicker && (
        <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Assign leader
          </p>
          <div className="mt-2 flex gap-2">
            <select
              value={selectedLeaderId}
              onChange={(event) => setSelectedLeaderId(event.target.value)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select member</option>
              {normalizedMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAssignLeaderSubmit}
              disabled={!selectedLeaderId}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {isExpanded && normalizedMembers.length > 0 ? (
        <div className="mt-4 space-y-1.5">
          {normalizedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2"
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {member.username}
              </span>
              {member.normalizedRole === "LEADER" ? (
                <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-100 dark:ring-amber-800">
                  Leader
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Member
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {isExpanded && normalizedMembers.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No members yet
        </p>
      ) : null}
    </div>
  );
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  isTeacher: PropTypes.bool,
  onAddMember: PropTypes.func,
  onRemoveMember: PropTypes.func,
  onAssignLeader: PropTypes.func,
};

GroupCard.defaultProps = {
  isTeacher: false,
  onAddMember: () => {},
  onRemoveMember: () => {},
  onAssignLeader: () => {},
};

export default GroupCard;
