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
        (submission_id, evaluator_id, score, feedback)
      VALUES
        ($1, $2, $3, $4)
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

router.get("/:assignmentId/evaluation", requireAuth, async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId;
    const userId = req.user.id;

    const assignmentResult = await db.query(
      `
      SELECT a.id, a.class_id, a.submission_type
      FROM assignments a
      WHERE a.id = $1
      `,
      [assignmentId],
    );

    if (assignmentResult.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { class_id, submission_type } = assignmentResult.rows[0];

    const enrollmentResult = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [userId, class_id],
    );

    if (enrollmentResult.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in class" });
    }

    let submissionId;

    if (submission_type === "INDIVIDUAL") {
      const submissionResult = await db.query(
        `
        SELECT id FROM submissions
        WHERE assignment_id = $1 AND user_id = $2
        LIMIT 1
        `,
        [assignmentId, userId],
      );

      if (submissionResult.rowCount === 0) {
        return res.json(null);
      }

      submissionId = submissionResult.rows[0].id;
    } else if (submission_type === "GROUP") {
      const groupResult = await db.query(
        `
        SELECT gm.group_id
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.user_id = $1 AND g.class_id = $2
        LIMIT 1
        `,
        [userId, class_id],
      );

      if (groupResult.rowCount === 0) {
        return res.json(null);
      }

      const groupId = groupResult.rows[0].group_id;

      const submissionResult = await db.query(
        `
        SELECT id FROM submissions
        WHERE assignment_id = $1 AND group_id = $2
        LIMIT 1
        `,
        [assignmentId, groupId],
      );

      if (submissionResult.rowCount === 0) {
        return res.json(null);
      }

      submissionId = submissionResult.rows[0].id;
    } else {
      return res.json(null);
    }

    const evaluationResult = await db.query(
      `
      SELECT score, feedback
      FROM evaluations
      WHERE submission_id = $1
      LIMIT 1
      `,
      [submissionId],
    );

    if (evaluationResult.rowCount === 0) {
      return res.json(null);
    }

    const evaluation = evaluationResult.rows[0];
    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
