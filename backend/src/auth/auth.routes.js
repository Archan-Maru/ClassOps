import { Router } from "express";
import crypto from "crypto";
import db from "../config/db.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateOtpCode,
} from "./auth.service.js";
import { requireAuth } from "./auth.middleware.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email/email.service.js";


const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { email, username, password, role } = req.body;

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
    const otpCode = generateOtpCode();

    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, role, is_verified, email_otp, otp_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, username, role, is_verified`,
      [email, username, passwordHash, normalizedRole, false, otpCode, new Date(Date.now() + 10 * 60 * 1000)]
    );

    const user = result.rows[0];

    try {
      await sendVerificationEmail(email, username, otpCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      message: "Verification OTP sent",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_verified: user.is_verified,
      },
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
      `SELECT id, email, username, password_hash, role, is_verified
       FROM users
       WHERE email = $1 OR username = $1`,
      [identifier]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not registered" });
    }

    const user = result.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ 
        message: "Please verify your email first",
        email: user.email
      });
    }

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

router.post("/verify-email", async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({ message: "OTP and email are required" });
    }

    const result = await db.query(
      `SELECT id, email, username, is_verified, otp_expires_at
       FROM users
       WHERE email = $1 AND email_otp = $2`,
      [email, otp]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    await db.query(
      `UPDATE users
       SET is_verified = true, email_otp = NULL, otp_expires_at = NULL
       WHERE id = $1`,
      [user.id]
    );

    const loginToken = generateToken({ id: user.id, role: user.role });

    res.json({
      message: "Email verified successfully",
      token: loginToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await db.query(
      `SELECT id, email, username, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const otpCode = generateOtpCode();

    await db.query(
      `UPDATE users
       SET email_otp = $1, otp_expires_at = $2
       WHERE id = $3`,
      [otpCode, new Date(Date.now() + 10 * 60 * 1000), user.id]
    );

    try {
      await sendVerificationEmail(email, user.username, otpCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    res.json({ message: "Verification email sent successfully" });
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await db.query(
      "SELECT id, email, username FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.json({ message: "If this email exists, reset link sent" });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expires_at = NOW() + INTERVAL '1 hour' WHERE id = $2",
      [resetToken, user.id]
    );

    await sendPasswordResetEmail(user.email, user.username, resetToken);

    return res.json({ message: "If this email exists, reset link sent" });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }

    const result = await db.query(
      `SELECT id
       FROM users
       WHERE email = $1
         AND reset_token = $2
         AND reset_token_expires_at > NOW()`,
      [email, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = result.rows[0];
    const passwordHash = await hashPassword(newPassword);

    await db.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
});


export default router;
