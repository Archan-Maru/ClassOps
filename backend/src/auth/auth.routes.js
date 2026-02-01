import { Router } from "express";
import db from "../config/db.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "./auth.service.js";
import { requireAuth } from "./auth.middleware.js";


const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { email, username, password ,role} = req.body;

    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedRole = role?.toUpperCase();

  if (!["TEACHER", "STUDENT"].includes(normalizedRole)) {
  return res.status(400).json({ message: "Invalid role" });
  }


    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (email, username, password_hash,role)
       VALUES ($1, $2, $3,$4)
       RETURNING id, email, username,role`,
      [email, username, passwordHash,role]
    );

    const user = result.rows[0];

    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await db.query(
      `SELECT id, email, username, password_hash, role
       FROM users
       WHERE email = $1 OR username = $1`,
      [identifier]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not registered" });
    }

    const user = result.rows[0];

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, email, username, role
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});


export default router;
