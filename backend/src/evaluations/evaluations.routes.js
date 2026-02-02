import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();
router.post("/:id/evaluations", requireAuth, async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const evaluatorId = req.user.id;
    const { score, feedback } = req.body;

    const submissionResult = await db.query(
      `
      SELECT s.assignment_id, a.class_id
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE s.id = $1
      `,
      [submissionId],
    );

    if (submissionResult.rowCount === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const classId = submissionResult.rows[0].class_id;

    const roleCheck = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [evaluatorId, classId],
    );

    if (
      roleCheck.rowCount === 0 ||
      !["TEACHER", "TA"].includes(roleCheck.rows[0].role)
    ) {
      return res.status(403).json({ message: "Not allowed to evaluate" });
    }

    const result = await db.query(
      `
      INSERT INTO evaluations
        (submission_id, evaluator_id, score, feedback, is_ai)
      VALUES
        ($1, $2, $3, $4, false)
      RETURNING id, score, feedback, created_at
      `,
      [submissionId, evaluatorId, score || null, feedback || null],
    );

    res.status(201).json({ evaluation: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/evaluations", requireAuth, async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.id;

    const submissionResult = await db.query(
      `
      SELECT a.class_id
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE s.id = $1
      `,
      [submissionId],
    );

    if (submissionResult.rowCount === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const classId = submissionResult.rows[0].class_id;

    const enrolled = await db.query(
      `
      SELECT 1
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [userId, classId],
    );

    if (enrolled.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const result = await db.query(
      `
      SELECT
        e.id,
        e.score,
        e.feedback,
        e.is_ai,
        e.created_at,
        u.username AS evaluator_name
      FROM evaluations e
      JOIN users u ON u.id = e.evaluator_id
      WHERE e.submission_id = $1
      ORDER BY e.created_at DESC
      `,
      [submissionId],
    );

    res.status(200).json({ evaluations: result.rows });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const evaluationId = req.params.id;
    const userId = req.user.id;
    const { score, feedback } = req.body;

    const evalResult = await db.query(
      `
      SELECT evaluator_id
      FROM evaluations
      WHERE id = $1
      `,
      [evaluationId],
    );

    if (evalResult.rowCount === 0) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    const evaluation = evalResult.rows[0];

    if (evaluation.evaluator_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this evaluation" });
    }

    const updated = await db.query(
      `
      UPDATE evaluations
      SET score = $1,
          feedback = $2
      WHERE id = $3
      RETURNING id, score, feedback, created_at
      `,
      [score || null, feedback || null, evaluationId],
    );

    res.status(200).json({ evaluation: updated.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
