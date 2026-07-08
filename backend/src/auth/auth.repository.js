import db from "../config/db.js";

export async function findByEmailOrUsername(email, username) {
  const result = await db.query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)",
    [email, username]
  );
  return result.rows;
}

export async function createUser(data) {
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash, role, is_verified, email_otp, otp_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, username, role, is_verified`,
    [data.email, data.username, data.passwordHash, data.role, false, data.otpCode, data.otpExpiresAt]
  );
  return result.rows[0];
}

export async function findForLogin(identifier) {
  const result = await db.query(
    `SELECT id, email, username, password_hash, role, is_verified
     FROM users
     WHERE email = $1 OR username = $1`,
    [identifier]
  );
  return result.rows[0] || null;
}

export async function findById(id) {
  const result = await db.query(
    `SELECT id, email, username, role
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findByEmailAndOtp(email, otp) {
  const result = await db.query(
    `SELECT id, email, username, is_verified, otp_expires_at, role
     FROM users
     WHERE email = $1 AND email_otp = $2`,
    [email, otp]
  );
  return result.rows[0] || null;
}

export async function verifyUser(id) {
  await db.query(
    `UPDATE users
     SET is_verified = true, email_otp = NULL, otp_expires_at = NULL
     WHERE id = $1`,
    [id]
  );
}

export async function findByEmail(email) {
  const result = await db.query(
    `SELECT id, email, username, is_verified
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function updateOtp(id, otpCode, otpExpiresAt) {
  await db.query(
    `UPDATE users
     SET email_otp = $1, otp_expires_at = $2
     WHERE id = $3`,
    [otpCode, otpExpiresAt, id]
  );
}

export async function setResetToken(id, resetToken, expiresAt) {
  await db.query(
    "UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3",
    [resetToken, expiresAt, id]
  );
}

export async function findByEmailAndResetToken(email, token) {
  const result = await db.query(
    `SELECT id
     FROM users
     WHERE email = $1
       AND reset_token = $2
       AND reset_token_expires_at > NOW()`,
    [email, token]
  );
  return result.rows[0] || null;
}

export async function updatePassword(id, passwordHash) {
  await db.query(
    `UPDATE users
     SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL
     WHERE id = $2`,
    [passwordHash, id]
  );
}
