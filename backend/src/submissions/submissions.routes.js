import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";
import upload from "../middleware/upload.middleware.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const router = Router();

router.get("/user/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await db.query(
      `SELECT id, username FROM users WHERE id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/submissions",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const assignmentId = req.params.id;
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
          return res.status(409).json({ message: "Already submitted" });
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

        return res.status(201).json({
          submission: result.rows[0],
          message: "Submitted for entire group",
        });
      }

      return res.status(400).json({ message: "Invalid submission type" });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id/submission/me", requireAuth, async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    const assignment = await db.query(
      `
      SELECT class_id, submission_type
      FROM assignments
      WHERE id = $1
      `,
      [assignmentId],
    );

    if (assignment.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { class_id, submission_type } = assignment.rows[0];

    if (submission_type === "INDIVIDUAL") {
      const result = await db.query(
        `
        SELECT *
        FROM submissions
        WHERE assignment_id = $1 AND user_id = $2
        `,
        [assignmentId, userId],
      );

      return res.status(200).json({
        submission: result.rows[0] || null,
      });
    }

    const group = await db.query(
      `
      SELECT gm.group_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = $1 AND g.class_id = $2
      `,
      [userId, class_id],
    );

    if (group.rowCount === 0) {
      return res.status(200).json({ submission: null });
    }

    const result = await db.query(
      `
      SELECT *
      FROM submissions
      WHERE assignment_id = $1 AND group_id = $2
      `,
      [assignmentId, group.rows[0].group_id],
    );

    res.status(200).json({
      submission: result.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/submissions", requireAuth, async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    const assignment = await db.query(
      `
      SELECT class_id
      FROM assignments
      WHERE id = $1
      `,
      [assignmentId],
    );

    if (assignment.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const classId = assignment.rows[0].class_id;

    const roleCheck = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [userId, classId],
    );

    if (
      roleCheck.rowCount === 0 ||
      !["TEACHER", "TA"].includes(roleCheck.rows[0].role)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const result = await db.query(
      `
      SELECT
        s.id,
        s.user_id,
        s.group_id,
        u.username,
        g.name AS group_name,
        s.content_url,
        s.content_text,
        s.submitted_at,
        e.id AS evaluation_id,
        e.score,
        e.feedback
      FROM submissions s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN groups g ON g.id = s.group_id
      LEFT JOIN evaluations e ON e.submission_id = s.id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC
      `,
      [assignmentId],
    );

    res.status(200).json({ submissions: result.rows });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const submissionId = req.params.id;
      const userId = req.user.id;
      const { content_text } = req.body;
      let content_url = req.body.content_url || null;

      if (req.file && req.file.buffer) {
        try {
          const uploadResult = await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.originalname,
            `submissions/${submissionId}`,
          );
          content_url = uploadResult.secure_url || content_url;
        } catch (err) {
          return next(err);
        }
      }

      let originalFilename = null;
      if (req.file) {
        originalFilename = req.file.originalname || null;
      }

      const submissionResult = await db.query(
        `
      SELECT s.user_id, s.group_id, a.class_id, a.submission_type
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE s.id = $1
      `,
        [submissionId],
      );

      if (submissionResult.rowCount === 0) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const submission = submissionResult.rows[0];

      if (submission.submission_type === "INDIVIDUAL") {
        if (submission.user_id !== userId) {
          return res.status(403).json({ message: "Not allowed" });
        }
      }

      if (submission.submission_type === "GROUP") {
        const leaderCheck = await db.query(
          `
        SELECT 1
        FROM group_members
        WHERE group_id = $1 AND user_id = $2 AND role = 'LEADER'
        `,
          [submission.group_id, userId],
        );

        if (leaderCheck.rowCount === 0) {
          return res
            .status(403)
            .json({ message: "Only group leader can edit" });
        }
      }

      const updated = await db.query(
        `
      UPDATE submissions
      SET content_url = $1,
          content_text = $2,
          original_filename = COALESCE($4, original_filename),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, updated_at
      `,
        [
          content_url || null,
          content_text || null,
          submissionId,
          originalFilename,
        ],
      );

      res.status(200).json({ submission: updated.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.id;

    const submissionResult = await db.query(
      `
      SELECT s.user_id, s.group_id, a.submission_type
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE s.id = $1
      `,
      [submissionId],
    );

    if (submissionResult.rowCount === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submission = submissionResult.rows[0];

    if (submission.submission_type === "INDIVIDUAL") {
      if (submission.user_id !== userId) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    if (submission.submission_type === "GROUP") {
      const leaderCheck = await db.query(
        `
        SELECT 1
        FROM group_members
        WHERE group_id = $1 AND user_id = $2 AND role = 'LEADER'
        `,
        [submission.group_id, userId],
      );

      if (leaderCheck.rowCount === 0) {
        return res
          .status(403)
          .json({ message: "Only group leader can delete" });
      }
    }

    await db.query(
      `
      DELETE FROM submissions
      WHERE id = $1
      `,
      [submissionId],
    );

    res.status(200).json({ message: "Submission deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/:assignmentId/submission", requireAuth, async (req, res, next) => {
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

    if (submission_type === "INDIVIDUAL") {
      const submissionResult = await db.query(
        `
        SELECT id, content_url, content_text, submitted_at, original_filename
        FROM submissions
        WHERE assignment_id = $1 AND user_id = $2
        LIMIT 1
        `,
        [assignmentId, userId],
      );

      if (submissionResult.rowCount === 0) {
        return res.json({
          exists: false,
          content: null,
          submitted_at: null,
          original_filename: null,
        });
      }

      const submission = submissionResult.rows[0];
      return res.json({
        exists: true,
        id: submission.id,
        content: submission.content_url || submission.content_text,
        original_filename: submission.original_filename || null,
        submitted_at: submission.submitted_at,
      });
    }

    if (submission_type === "GROUP") {
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
        return res.json({
          exists: false,
          content: null,
          submitted_at: null,
        });
      }

      const groupId = groupResult.rows[0].group_id;

      const submissionResult = await db.query(
        `
        SELECT id, content_url, content_text, submitted_at, original_filename
        FROM submissions
        WHERE assignment_id = $1 AND group_id = $2
        LIMIT 1
        `,
        [assignmentId, groupId],
      );

      if (submissionResult.rowCount === 0) {
        return res.json({
          exists: false,
          content: null,
          submitted_at: null,
          original_filename: null,
        });
      }

      const submission = submissionResult.rows[0];
      return res.json({
        exists: true,
        id: submission.id,
        content: submission.content_url || submission.content_text,
        original_filename: submission.original_filename || null,
        submitted_at: submission.submitted_at,
      });
    }

    return res.json({
      exists: false,
      content: null,
      submitted_at: null,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/:assignmentId/submissions",
  requireAuth,
  async (req, res, next) => {
    try {
      const assignmentId = req.params.assignmentId;
      const userId = req.user.id;
      const { sortBy = "latest" } = req.query;

      const assignmentResult = await db.query(
        `
      SELECT a.id, a.class_id
      FROM assignments a
      WHERE a.id = $1
      `,
        [assignmentId],
      );

      if (assignmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const classId = assignmentResult.rows[0].class_id;

      const enrollmentResult = await db.query(
        `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
        [userId, classId],
      );

      if (
        enrollmentResult.rowCount === 0 ||
        enrollmentResult.rows[0].role !== "TEACHER"
      ) {
        return res
          .status(403)
          .json({ message: "Only teachers can view submissions" });
      }

      const orderBy = sortBy === "earliest" ? "ASC" : "DESC";
      const submissionsResult = await db.query(
        `
      SELECT
        s.id,
        s.user_id,
        u.username,
        s.content_url,
        s.content_text,
        s.submitted_at,
        e.id AS evaluation_id,
        e.score,
        e.feedback
      FROM submissions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN evaluations e ON e.submission_id = s.id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at ${orderBy}
      `,
        [assignmentId],
      );

      res.json({ submissions: submissionsResult.rows });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
