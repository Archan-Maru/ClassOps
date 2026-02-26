import PropTypes from "prop-types";

function PeopleList({ people }) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No students enrolled yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {people.map((person) => (
        <div
          key={person.id}
          className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {person.username}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {person.role}
            </p>
          </div>
          {person.role === "TEACHER" && (
            <span className="rounded-full bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-100 dark:ring-violet-800">
              Teacher
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

PeopleList.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default PeopleList;
