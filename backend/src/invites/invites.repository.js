import db from "../config/db.js";

export async function checkEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT role FROM enrollments WHERE user_id = $1 AND class_id = $2`,
    [userId, classId]
  );
  return result.rows[0] || null;
}

export async function getClassDetails(classId, userId) {
  const result = await db.query(
    `SELECT c.title, u.username AS teacher_name
     FROM classes c
     JOIN users u ON u.id = $2
     WHERE c.id = $1`,
    [classId, userId]
  );
  return result.rows[0] || null;
}

export async function checkAlreadyEnrolled(classId, email) {
  const result = await db.query(
    `SELECT 1 FROM enrollments e
     JOIN users u ON u.id = e.user_id
     WHERE u.email = $1 AND e.class_id = $2`,
    [email, classId]
  );
  return result.rowCount > 0;
}

export async function checkPendingInvite(classId, email) {
  const result = await db.query(
    `SELECT 1 FROM class_invites
     WHERE email = $1 AND class_id = $2 AND status = 'PENDING'`,
    [email, classId]
  );
  return result.rowCount > 0;
}

export async function createInvite(classId, email, token, userId) {
  await db.query(
    `INSERT INTO class_invites (class_id, email, token, invited_by)
     VALUES ($1, $2, $3, $4)`,
    [classId, email, token, userId]
  );
}

export async function getInvites(classId) {
  const result = await db.query(
    `SELECT id, email, status, created_at, accepted_at
     FROM class_invites
     WHERE class_id = $1
     ORDER BY created_at DESC`,
    [classId]
  );
  return result.rows;
}

export async function getInviteByToken(token) {
  const result = await db.query(
    `SELECT ci.id, ci.class_id, ci.email, ci.status, c.title AS class_title
     FROM class_invites ci
     JOIN classes c ON c.id = ci.class_id
     WHERE ci.token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

export async function getUserEmail(userId) {
  const result = await db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
  return result.rows[0]?.email;
}

export async function updateInviteStatus(inviteId) {
  await db.query(
    `UPDATE class_invites SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [inviteId]
  );
}

export async function createEnrollment(userId, classId) {
  await db.query(
    `INSERT INTO enrollments (user_id, class_id, role) VALUES ($1, $2, 'STUDENT')`,
    [userId, classId]
  );
}

export async function getInviteInfo(token) {
  const result = await db.query(
    `SELECT ci.status, ci.email, c.title AS class_title, u.username AS invited_by
     FROM class_invites ci
     JOIN classes c ON c.id = ci.class_id
     JOIN users u ON u.id = ci.invited_by
     WHERE ci.token = $1`,
    [token]
  );
  return result.rows[0] || null;
}
