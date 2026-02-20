import PropTypes from "prop-types";

function ClassworkCard({ title, description, resourceUrl, createdAt }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-sm shadow-slate-950/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {description && <p className="mt-2 text-sm text-slate-300">{description}</p>}
          <div className="mt-2 flex gap-3">
            <span className="text-xs text-slate-400">
              Uploaded {createdAt}
            </span>
          </div>
        </div>
      </div>
      {resourceUrl && (
        <a
          href={resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block w-full rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-slate-100 hover:bg-indigo-700"
        >
          Open Resource
        </a>
      )}
    </div>
  );
}

ClassworkCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  resourceUrl: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
};

ClassworkCard.defaultProps = {
  description: "",
  resourceUrl: "",
};

export default ClassworkCard;
