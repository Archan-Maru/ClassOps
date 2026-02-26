import PropTypes from "prop-types";

function EvaluationCard({ score, feedback }) {
  if (!score && !feedback) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Evaluation
        </h3>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          No evaluation yet. Your teacher will review your submission soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Evaluation
      </h3>

      {score && (
        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Score
          </p>
          <p className="mt-1 text-3xl font-bold text-violet-600 dark:text-violet-400">
            {score}
          </p>
        </div>
      )}

      {feedback && (
        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Feedback
          </p>
          <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {feedback}
            </p>
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
