import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

router.post("/:id/groups", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const enrollment = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [userId, classId],
    );

    if (enrollment.rowCount === 0 || enrollment.rows[0].role !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Only teachers can create groups" });
    }

    const result = await db.query(
      `
      INSERT INTO groups (class_id, name)
      VALUES ($1, $2)
      RETURNING id, name, created_at
      `,
      [classId, name],
    );

    res.status(201).json({ group: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/available-students", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;
    const requesterId = req.user.id;

    const teacherCheck = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [requesterId, classId],
    );

    if (teacherCheck.rowCount === 0 || teacherCheck.rows[0].role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can view available students" });
    }

    const result = await db.query(
      `
      SELECT u.id, u.username
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.class_id = $1
        AND e.role = 'STUDENT'
        AND NOT EXISTS (
          SELECT 1
          FROM group_members gm
          JOIN groups g ON g.id = gm.group_id
          WHERE g.class_id = e.class_id
            AND gm.user_id = e.user_id
        )
      ORDER BY u.username ASC
      `,
      [classId],
    );

    return res.status(200).json({ students: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.post("/groups/:id/members", requireAuth, async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const groupResult = await db.query(
      `SELECT class_id FROM groups WHERE id = $1`,
      [groupId],
    );

    if (groupResult.rowCount === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    const classId = groupResult.rows[0].class_id;

    const teacherCheck = await db.query(
      `
      SELECT role
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
      `,
      [req.user.id, classId],
    );

    if (
      teacherCheck.rowCount === 0 ||
      teacherCheck.rows[0].role !== "TEACHER"
    ) {
      return res.status(403).json({ message: "Only teachers can add members" });
    }

    const studentEnroll = await db.query(
      `
      SELECT 1
      FROM enrollments
      WHERE user_id = $1 AND class_id = $2
        AND role = 'STUDENT'
      `,
      [user_id, classId],
    );

    if (studentEnroll.rowCount === 0) {
      return res.status(400).json({ message: "User is not a student in this class" });
    }

    const alreadyInGroup = await db.query(
      `
      SELECT 1
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.class_id = $1 AND gm.user_id = $2
      `,
      [classId, user_id],
    );

    if (alreadyInGroup.rowCount > 0) {
      return res.status(409).json({ message: "Student is already in a group" });
    }

    await db.query(
      `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'MEMBER')
      `,
      [groupId, user_id],
    );

    res.status(201).json({ message: "Member added to group" });
  } catch (err) {
    next(err);
  }
});

router.post("/groups/:id/leader", requireAuth, async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User id is required" });
    }

    await db.query(
      `
      UPDATE group_members
      SET role = 'MEMBER'
      WHERE group_id = $1
      `,
      [groupId],
    );

    const updated = await db.query(
      `
      UPDATE group_members
      SET role = 'LEADER'
      WHERE group_id = $1 AND user_id = $2
      RETURNING user_id
      `,
      [groupId, user_id],
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ message: "User not in group" });
    }

    res.status(200).json({ message: "Leader assigned" });
  } catch (err) {
    next(err);
  }
});

router.get("/groups/:id/members", requireAuth, async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    // get class of group
    const groupResult = await db.query(
      `SELECT class_id FROM groups WHERE id = $1`,
      [groupId],
    );

    if (groupResult.rowCount === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    const classId = groupResult.rows[0].class_id;

    // ensure requester is enrolled
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

    const membersResult = await db.query(
      `
      SELECT
        u.id,
        u.username,
        gm.role
      FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = $1
      `,
      [groupId],
    );

    res.status(200).json({ members: membersResult.rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/groups", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;
    const userId=req.user.id;
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
      SELECT id, name, created_at
      FROM groups
      WHERE class_id = $1
      ORDER BY created_at
      `,
      [classId],
    );

    res.status(200).json({ groups: result.rows });
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/groups/:groupId/members/:userId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { groupId, userId } = req.params;
      const requesterId = req.user.id;

      const groupResult = await db.query(
        `SELECT class_id FROM groups WHERE id = $1`,
        [groupId],
      );

      if (groupResult.rowCount === 0) {
        return res.status(404).json({ message: "Group not found" });
      }

      const classId = groupResult.rows[0].class_id;

      const teacherCheck = await db.query(
        `
        SELECT role
        FROM enrollments
        WHERE user_id = $1 AND class_id = $2
        `,
        [requesterId, classId],
      );

      if (
        teacherCheck.rowCount === 0 ||
        teacherCheck.rows[0].role !== "TEACHER"
      ) {
        return res
          .status(403)
          .json({ message: "Only teachers can remove members" });
      }

      const removed = await db.query(
        `
        DELETE FROM group_members
        WHERE group_id = $1 AND user_id = $2
        `,
        [groupId, userId],
      );

      if (removed.rowCount === 0) {
        return res.status(404).json({ message: "User not in group" });
      }

      res.status(200).json({ message: "Member removed from group" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
