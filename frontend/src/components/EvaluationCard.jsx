import PropTypes from "prop-types";

function EvaluationCard({ score, feedback }) {
  if (!score && !feedback) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="text-lg font-semibold text-slate-100">Evaluation</h3>
        <p className="mt-3 text-slate-400">No evaluation yet. Your teacher will review your submission soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="text-lg font-semibold text-slate-100">Evaluation</h3>

      {score && (
        <div className="mt-4">
          <p className="text-sm text-slate-400">Score</p>
          <p className="mt-1 text-3xl font-bold text-green-400">{score}</p>
        </div>
      )}

      {feedback && (
        <div className="mt-4">
          <p className="text-sm text-slate-400">Feedback</p>
          <div className="mt-2 rounded-lg border border-slate-600 bg-slate-900/40 p-3">
            <p className="text-slate-300">{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

EvaluationCard.propTypes = {
  score: PropTypes.string,
  feedback: PropTypes.string,
};

EvaluationCard.defaultProps = {
  score: "",
  feedback: "",
};

export default EvaluationCard;
