import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const userResult = await db.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can create classes" });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Class title is required" });
    }

    const classResult = await db.query(
      `INSERT INTO classes (title, description, teacher_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, created_at`,
      [title, description || null, req.user.id]
    );

    const newClass = classResult.rows[0];

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role)
       VALUES ($1, $2, 'TEACHER')`,
      [req.user.id, newClass.id]
    );

    res.status(201).json({ class: newClass });
  } 
  catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT
        c.id,
        c.title,
        c.description,
        u.username AS teacher_name
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      JOIN users u ON u.id = c.teacher_id
      WHERE e.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [req.user.id]
    );

    res.status(200).json({
      classes: result.rows
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const classId = req.params.id;

    const classResult = await db.query(
      `SELECT id FROM classes WHERE id = $1`,
      [classId]
    );

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const existing = await db.query(
      `SELECT 1 FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, classId]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Already enrolled" });
    }

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role)
       VALUES ($1, $2, 'STUDENT')`,
      [userId, classId]
    );

    res.status(201).json({ message: "Joined class successfully" });
  } catch (err) {
    next(err);
  }
});


export default router;
