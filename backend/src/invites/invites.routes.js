import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";
import { sendClassInviteEmail } from "../email/email.service.js";

const router = Router();

router.post("/:classId/invites", requireAuth, async (req, res, next) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "At least one email is required" });
    }

    if (emails.length > 20) {
      return res.status(400).json({ message: "Maximum 20 invites at a time" });
    }

    const roleCheck = await db.query(
      `SELECT role FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, classId]
    );

    if (roleCheck.rowCount === 0 || roleCheck.rows[0].role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can send invites" });
    }

    const classResult = await db.query(
      `SELECT c.title, u.username AS teacher_name
       FROM classes c
       JOIN users u ON u.id = $2
       WHERE c.id = $1`,
      [classId, userId]
    );

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const { title: className, teacher_name: teacherName } = classResult.rows[0];

    const results = [];

    for (const email of emails) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) continue;

      const alreadyEnrolled = await db.query(
        `SELECT 1 FROM enrollments e
         JOIN users u ON u.id = e.user_id
         WHERE u.email = $1 AND e.class_id = $2`,
        [trimmed, classId]
      );

      if (alreadyEnrolled.rowCount > 0) {
        results.push({ email: trimmed, status: "already_enrolled" });
        continue;
      }

      const pendingInvite = await db.query(
        `SELECT 1 FROM class_invites
         WHERE email = $1 AND class_id = $2 AND status = 'PENDING'`,
        [trimmed, classId]
      );

      if (pendingInvite.rowCount > 0) {
        results.push({ email: trimmed, status: "already_invited" });
        continue;
      }

      const token = crypto.randomBytes(24).toString("hex");

      await db.query(
        `INSERT INTO class_invites (class_id, email, token, invited_by)
         VALUES ($1, $2, $3, $4)`,
        [classId, trimmed, token, userId]
      );

      const sent = await sendClassInviteEmail(trimmed, teacherName, className, token);
      results.push({ email: trimmed, status: sent ? "sent" : "email_failed" });
    }

    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
});

router.get("/:classId/invites", requireAuth, async (req, res, next) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    const roleCheck = await db.query(
      `SELECT role FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, classId]
    );

    if (roleCheck.rowCount === 0 || roleCheck.rows[0].role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can view invites" });
    }

    const invites = await db.query(
      `SELECT id, email, status, created_at, accepted_at
       FROM class_invites
       WHERE class_id = $1
       ORDER BY created_at DESC`,
      [classId]
    );

    res.json({ invites: invites.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/accept-invite/:token", requireAuth, async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const invite = await db.query(
      `SELECT ci.id, ci.class_id, ci.email, ci.status, c.title AS class_title
       FROM class_invites ci
       JOIN classes c ON c.id = ci.class_id
       WHERE ci.token = $1`,
      [token]
    );

    if (invite.rowCount === 0) {
      return res.status(404).json({ message: "Invite not found or expired" });
    }

    const inv = invite.rows[0];

    if (inv.status === "ACCEPTED") {
      return res.status(400).json({ message: "Invite already accepted", classId: inv.class_id });
    }

    const user = await db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    if (user.rows[0].email.toLowerCase() !== inv.email.toLowerCase()) {
      return res.status(403).json({
        message: "This invite was sent to a different email address",
      });
    }

    const existing = await db.query(
      `SELECT 1 FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, inv.class_id]
    );

    if (existing.rowCount > 0) {
      await db.query(
        `UPDATE class_invites SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [inv.id]
      );
      return res.json({ message: "Already enrolled", classId: inv.class_id });
    }

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role) VALUES ($1, $2, 'STUDENT')`,
      [userId, inv.class_id]
    );

    await db.query(
      `UPDATE class_invites SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [inv.id]
    );

    res.json({ message: "Joined class successfully", classId: inv.class_id, classTitle: inv.class_title });
  } catch (err) {
    next(err);
  }
});

router.get("/invite-info/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

    const invite = await db.query(
      `SELECT ci.status, ci.email, c.title AS class_title, u.username AS invited_by
       FROM class_invites ci
       JOIN classes c ON c.id = ci.class_id
       JOIN users u ON u.id = ci.invited_by
       WHERE ci.token = $1`,
      [token]
    );

    if (invite.rowCount === 0) {
      return res.status(404).json({ message: "Invite not found" });
    }

    const inv = invite.rows[0];
    res.json({
      classTitle: inv.class_title,
      invitedBy: inv.invited_by,
      email: inv.email,
      status: inv.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
