import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

router.post("/:id/assignments", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    const enrollmentResult = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
      [classId, userId]
    );

    if (enrollmentResult.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this class" });
    }

    const localRole = enrollmentResult.rows[0].role;

    if (localRole !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Only class teachers can create assignments" });
    }

    const { title, description, submission_type, deadline } = req.body;

    if (!title || !submission_type || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["INDIVIDUAL", "GROUP"].includes(submission_type)) {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    const result = await db.query(
      `
      INSERT INTO assignments
        (class_id, title, description, submission_type, deadline, uploaded_by)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id, title, description, submission_type, deadline, created_at
      `,
      [
        classId,
        title,
        description || null,
        submission_type,
        deadline,
        userId,
      ]
    );

    res.status(201).json({
      assignment: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/assignments", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    const enrollment = await db.query(
      `
      SELECT 1
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
      [classId, userId]
    );

    if (enrollment.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You must be enrolled to view assignments" });
    }

    const assignmentsResult = await db.query(
      `
      SELECT
        id,
        title,
        description,
        submission_type,
        deadline,
        created_at
      FROM assignments
      WHERE class_id = $1
      ORDER BY created_at DESC
      `,
      [classId]
    );

    res.status(200).json({
      assignments: assignmentsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:assignmentId", requireAuth, async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId;
    const userId = req.user.id;

    const { title, description, deadline } = req.body;

    if (!title && !description && !deadline) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const assignmentResult = await db.query(
      `
      SELECT class_id
      FROM assignments
      WHERE id = $1
      `,
      [assignmentId]
    );

    if (assignmentResult.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const classId = assignmentResult.rows[0].class_id;

    const enrollment = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
      [classId, userId]
    );

    if (enrollment.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this class" });
    }

    if (enrollment.rows[0].role !== "TEACHER") {
      return res.status(403).json({ message: "Not allowed to edit assignment" });
    }

    const result = await db.query(
      `
      UPDATE assignments
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        deadline = COALESCE($3, deadline)
      WHERE id = $4
      RETURNING id, title, description, deadline, updated_at
      `,
      [title || null, description || null, deadline || null, assignmentId]
    );

    res.status(200).json({
      assignment: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});


export default router;
