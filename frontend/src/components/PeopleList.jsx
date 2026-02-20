import PropTypes from "prop-types";

function PeopleList({ people }) {
  if (people.length === 0) {
    return <p className="text-slate-400">No students enrolled yet</p>;
  }

  return (
    <div className="space-y-3">
      {people.map((person) => (
        <div
          key={person.id}
          className="rounded-xl border border-slate-700 bg-slate-800/80 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">{person.username}</p>
              <p className="text-xs text-slate-400">{person.role}</p>
            </div>
            {person.role === "TEACHER" && (
              <span className="rounded-full bg-indigo-600/20 px-2 py-1 text-xs font-medium text-indigo-200">
                Teacher
              </span>
            )}
          </div>
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
    })
  ).isRequired,
};

export default PeopleList;
