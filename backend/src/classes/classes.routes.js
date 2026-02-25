import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const userResult = await db.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [req.user.id],
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.role !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Only teachers can create classes" });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Class title is required" });
    }

    const classResult = await db.query(
      `INSERT INTO classes (title, description, teacher_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, created_at`,
      [title, description || null, req.user.id],
    );

    const newClass = classResult.rows[0];

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role)
       VALUES ($1, $2, 'TEACHER')`,
      [req.user.id, newClass.id],
    );

    res.status(201).json({ class: newClass });
  } catch (err) {
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
      [req.user.id],
    );

    res.status(200).json({
      classes: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;

    const result = await db.query(
      `
      SELECT
        c.*,
        u.username AS teacher_name,
        e.role AS user_role
      FROM classes c
      JOIN users u ON u.id = c.teacher_id
      LEFT JOIN enrollments e ON e.class_id = c.id AND e.user_id = $2
      WHERE c.id = $1 AND (e.user_id IS NOT NULL OR c.teacher_id = $2)
      `,
      [classId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ class: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/people", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;

    const enrolled = await db.query(
      `
      SELECT 1
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
      [classId, req.user.id],
    );

    if (enrolled.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this class" });
    }

    const peopleResult = await db.query(
      `
      SELECT
        u.id,
        u.username,
        e.role
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.class_id = $1
      ORDER BY e.role DESC, u.username ASC
      `,
      [classId],
    );

    res.status(200).json({ people: peopleResult.rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/classwork", requireAuth, async (req, res, next) => {
  try {
    const classId = req.params.id;

    const enrolled = await db.query(
      `
      SELECT 1
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
      [classId, req.user.id],
    );

    if (enrolled.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this class" });
    }

    const result = await db.query(
      `
      SELECT
        id,
        class_id,
        title,
        description,
        resource_url,
        created_at
      FROM classwork
      WHERE class_id = $1
      ORDER BY created_at DESC
      `,
      [classId],
    );

    res.status(200).json({ classwork: result.rows });
  } catch (err) {
    next(err);
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/:id/classwork",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const classId = req.params.id;
      const { title, description, resource_url } = req.body || {};

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const enrollment = await db.query(
        `
      SELECT role
      FROM enrollments
      WHERE class_id = $1 AND user_id = $2
      `,
        [classId, req.user.id],
      );

      if (enrollment.rowCount === 0 || enrollment.rows[0].role !== "TEACHER") {
        return res
          .status(403)
          .json({ message: "Only teachers can add classwork" });
      }

      let resourceUrlFinal = resource_url || null;

      // If a file was uploaded, upload it to Cloudinary and use the returned URL
      if (req.file) {
        try {
          const uploadRes = await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.originalname,
            `classes/${classId}`,
          );
          resourceUrlFinal =
            uploadRes.secure_url || uploadRes.url || resourceUrlFinal;
        } catch (uploadErr) {
          console.error("Cloudinary upload failed:", uploadErr);
          // proceed without resource url if upload fails
        }
      }

      const result = await db.query(
        `
      INSERT INTO classwork
        (class_id, title, description, resource_url, uploaded_by)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id, title, description, resource_url, created_at
      `,
        [
          classId,
          title,
          description || null,
          resourceUrlFinal || null,
          req.user.id,
        ],
      );

      res.status(201).json({ classwork: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id/classwork/:classworkId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { id: classId, classworkId } = req.params;
      const userId = req.user.id;

      const enrollment = await db.query(
        `SELECT role FROM enrollments WHERE class_id = $1 AND user_id = $2`,
        [classId, userId],
      );

      if (enrollment.rowCount === 0 || enrollment.rows[0].role !== "TEACHER") {
        return res
          .status(403)
          .json({ message: "Only teachers can delete classwork" });
      }

      const result = await db.query(
        `DELETE FROM classwork WHERE id = $1 AND class_id = $2 RETURNING id`,
        [classworkId, classId],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Classwork not found" });
      }

      res.status(200).json({ message: "Classwork deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const classId = req.params.id;

    const classResult = await db.query(`SELECT id FROM classes WHERE id = $1`, [
      classId,
    ]);

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const existing = await db.query(
      `SELECT 1 FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, classId],
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Already enrolled" });
    }

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role)
       VALUES ($1, $2, 'STUDENT')`,
      [userId, classId],
    );

    res.status(201).json({ message: "Joined class successfully" });
  } catch (err) {
    next(err);
  }
});

router.post("/join-by-code", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Class code is required" });
    }

    const normalizedCode = code.trim().toUpperCase();
    let classId = null;

    // Parse CLASS-{id} format
    if (normalizedCode.startsWith("CLASS-")) {
      const parsed = parseInt(normalizedCode.substring(6), 10);
      if (!isNaN(parsed) && parsed > 0) {
        classId = parsed;
      }
    }

    if (!classId) {
      return res.status(400).json({ message: "Invalid class code format" });
    }

    const classResult = await db.query(`SELECT id FROM classes WHERE id = $1`, [
      classId,
    ]);

    if (classResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const existing = await db.query(
      `SELECT 1 FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [userId, classId],
    );

    if (existing.rowCount > 0) {
      return res
        .status(409)
        .json({ message: "Already enrolled in this class" });
    }

    await db.query(
      `INSERT INTO enrollments (user_id, class_id, role)
       VALUES ($1, $2, 'STUDENT')`,
      [userId, classId],
    );

    res.status(201).json({ message: "Joined class successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
