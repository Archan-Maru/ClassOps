import db from "../config/db.js";

export async function checkEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT role FROM enrollments WHERE class_id = $1 AND user_id = $2`,
    [classId, userId]
  );
  return result.rows[0] || null;
}

export async function createGroup(classId, name) {
  const result = await db.query(
    `INSERT INTO groups (class_id, name) VALUES ($1, $2) RETURNING id, name, created_at`,
    [classId, name]
  );
  return result.rows[0];
}

export async function getAvailableStudents(classId) {
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
    [classId]
  );
  return result.rows;
}

export async function getGroupClassId(groupId) {
  const result = await db.query(`SELECT class_id FROM groups WHERE id = $1`, [groupId]);
  return result.rows[0] || null;
}

export async function checkStudentEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT 1 FROM enrollments WHERE class_id = $1 AND user_id = $2 AND role = 'STUDENT'`,
    [classId, userId]
  );
  return result.rowCount > 0;
}

export async function checkAlreadyInGroup(classId, userId) {
  const result = await db.query(
    `
    SELECT 1
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE g.class_id = $1 AND gm.user_id = $2
    `,
    [classId, userId]
  );
  return result.rowCount > 0;
}

export async function addMemberToGroup(groupId, userId) {
  await db.query(
    `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'MEMBER')`,
    [groupId, userId]
  );
}

export async function resetGroupRoles(groupId, client = db) {
  await client.query(
    `UPDATE group_members SET role = 'MEMBER' WHERE group_id = $1`,
    [groupId]
  );
}

export async function setGroupLeader(groupId, userId, client = db) {
  const result = await client.query(
    `UPDATE group_members SET role = 'LEADER' WHERE group_id = $1 AND user_id = $2 RETURNING user_id`,
    [groupId, userId]
  );
  return result.rowCount > 0;
}

export async function getGroupMembers(groupId) {
  const result = await db.query(
    `
    SELECT u.id, u.username, gm.role
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = $1
    `,
    [groupId]
  );
  return result.rows;
}

export async function getGroupsInClass(classId) {
  const result = await db.query(
    `
    SELECT id, name, created_at
    FROM groups
    WHERE class_id = $1
    ORDER BY created_at
    `,
    [classId]
  );
  return result.rows;
}

export async function removeMemberFromGroup(groupId, userId) {
  const result = await db.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return result.rowCount > 0;
}
