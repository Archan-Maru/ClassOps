import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";
import upload from "../middleware/upload.middleware.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const router = Router();

router.post(
  "/:id/assignments",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const classId = req.params.id;
      const userId = req.user.id;

      const enrollmentResult = await db.query(
        `
      SELECT role
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
        [classId, userId],
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

      let fileUrl = null;
      if (req.file && req.file.buffer) {
        try {
          const uploadResult = await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.originalname,
            `assignments/${classId}`,
          );
          fileUrl = uploadResult.secure_url || null;
        } catch (err) {
          return next(err);
        }
      }

      const result = await db.query(
        `
      INSERT INTO assignments
        (class_id, title, description, submission_type, deadline, uploaded_by, file_url)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id, title, description, submission_type, deadline, created_at, file_url
      `,
        [
          classId,
          title,
          description || null,
          submission_type,
          deadline,
          userId,
          fileUrl,
        ],
      );

      res.status(201).json({ assignment: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

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
      [classId, userId],
    );

    if (enrollment.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You must be enrolled to view assignments" });
    }

    const assignmentsResult = await db.query(
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.submission_type,
        a.deadline,
        a.created_at,
        CASE
          WHEN a.submission_type = 'GROUP' AND gs.id IS NOT NULL THEN 'Submitted'
          WHEN a.submission_type = 'INDIVIDUAL' AND us.id IS NOT NULL THEN 'Submitted'
          ELSE 'Not Submitted'
        END AS status
      FROM assignments a
      LEFT JOIN submissions us
        ON us.assignment_id = a.id AND us.user_id = $2
      LEFT JOIN group_members gm
        ON gm.user_id = $2
      LEFT JOIN submissions gs
        ON gs.assignment_id = a.id AND gs.group_id = gm.group_id
      WHERE a.class_id = $1
      ORDER BY a.created_at DESC
      `,
      [classId, userId],
    );

    res.status(200).json({
      assignments: assignmentsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/:id/assignments/:assignmentId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { id: classId, assignmentId } = req.params;
      const userId = req.user.id;

      const enrollment = await db.query(
        `
      SELECT 1
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
        [classId, userId],
      );

      if (enrollment.rowCount === 0) {
        return res
          .status(403)
          .json({ message: "You must be enrolled to view this assignment" });
      }

      const assignmentResult = await db.query(
        `
      SELECT
        id,
        title,
        description,
        submission_type,
        deadline,
        created_at
      FROM assignments
      WHERE id = $1 AND class_id = $2
      `,
        [assignmentId, classId],
      );

      if (assignmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.status(200).json(assignmentResult.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

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
      [assignmentId],
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
      [classId, userId],
    );

    if (enrollment.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this class" });
    }

    if (enrollment.rows[0].role !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Not allowed to edit assignment" });
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
      [title || null, description || null, deadline || null, assignmentId],
    );

    res.status(200).json({
      assignment: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:assignmentId", requireAuth, async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId;
    const userId = req.user.id;

    const assignmentResult = await db.query(
      `SELECT class_id FROM assignments WHERE id = $1`,
      [assignmentId],
    );

    if (assignmentResult.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const classId = assignmentResult.rows[0].class_id;

    const enrollment = await db.query(
      `SELECT role FROM enrollments WHERE class_id = $1 AND user_id = $2`,
      [classId, userId],
    );

    if (enrollment.rowCount === 0 || enrollment.rows[0].role !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Only teachers can delete assignments" });
    }

    // evaluations → submissions → assignment
    await db.query(
      `DELETE FROM evaluations WHERE submission_id IN (SELECT id FROM submissions WHERE assignment_id = $1)`,
      [assignmentId],
    );
    await db.query(`DELETE FROM submissions WHERE assignment_id = $1`, [
      assignmentId,
    ]);

    await db.query(`DELETE FROM assignments WHERE id = $1`, [assignmentId]);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:assignmentId/submissions",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const assignmentId = req.params.assignmentId;
      const userId = req.user.id;
      const { content_text } = req.body;
      let content_url = req.body.content_url || null;
      let originalFilename = null;

      if (req.file && req.file.buffer) {
        originalFilename = req.file.originalname || null;
        try {
          const uploadResult = await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.originalname,
            `submissions/${assignmentId}`,
          );
          content_url = uploadResult.secure_url || content_url;
        } catch (err) {
          return next(err);
        }
      }

      const assignmentResult = await db.query(
        `
      SELECT class_id, submission_type
      FROM assignments
      WHERE id = $1
      `,
        [assignmentId],
      );

      if (assignmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const { class_id, submission_type } = assignmentResult.rows[0];

      const enrollment = await db.query(
        `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
        [userId, class_id],
      );

      if (enrollment.rowCount === 0) {
        return res.status(403).json({ message: "Not enrolled in class" });
      }

      if (submission_type === "INDIVIDUAL") {
        const existing = await db.query(
          `
        SELECT 1
        FROM submissions
        WHERE assignment_id = $1 AND user_id = $2
        `,
          [assignmentId, userId],
        );

        if (existing.rowCount > 0) {
          return res.status(409).json({ message: "Already submitted" });
        }

        const result = await db.query(
          `
        INSERT INTO submissions
          (assignment_id, user_id, content_url, content_text, original_filename)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING id, submitted_at
        `,
          [
            assignmentId,
            userId,
            content_url || null,
            content_text || null,
            originalFilename,
          ],
        );

        return res.status(201).json({ submission: result.rows[0] });
      }

      if (submission_type === "GROUP") {
        const groupResult = await db.query(
          `
        SELECT gm.group_id, gm.role
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.user_id = $1 AND g.class_id = $2
        `,
          [userId, class_id],
        );

        if (groupResult.rowCount === 0) {
          return res.status(403).json({ message: "Not part of any group" });
        }

        const { group_id, role } = groupResult.rows[0];

        if (role !== "LEADER") {
          return res
            .status(403)
            .json({ message: "Only group leader can submit" });
        }

        const existing = await db.query(
          `
        SELECT 1
        FROM submissions
        WHERE assignment_id = $1 AND group_id = $2
        `,
          [assignmentId, group_id],
        );

        if (existing.rowCount > 0) {
          return res.status(409).json({ message: "Group already submitted" });
        }

        const result = await db.query(
          `
        INSERT INTO submissions
          (assignment_id, group_id, content_url, content_text, original_filename)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING id, submitted_at
        `,
          [
            assignmentId,
            group_id,
            content_url || null,
            content_text || null,
            originalFilename,
          ],
        );

        return res.status(201).json({ submission: result.rows[0] });
      }

      res.status(400).json({ message: "Invalid submission type" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
