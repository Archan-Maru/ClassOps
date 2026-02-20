import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function ClassCard({ id, title, teacher, meta }) {
  return (
    <Link
      to={`/classes/${id}`}
      className="block rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-sm shadow-slate-950/20"
    >
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{teacher}</p>
      {meta ? <p className="mt-3 text-xs text-slate-400">{meta}</p> : null}
    </Link>
  );
}

ClassCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  teacher: PropTypes.string.isRequired,
  meta: PropTypes.string,
};

ClassCard.defaultProps = {
  meta: "",
};

export default ClassCard;
