import db from "../config/db.js";

export async function findUserRole(userId) {
  const result = await db.query(
    `SELECT id, role FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

export async function createClass(title, description, teacherId, client = db) {
  const result = await client.query(
    `INSERT INTO classes (title, description, teacher_id)
     VALUES ($1, $2, $3)
     RETURNING id, title, description, created_at`,
    [title, description || null, teacherId]
  );
  return result.rows[0];
}

export async function createEnrollment(userId, classId, role, client = db) {
  await client.query(
    `INSERT INTO enrollments (user_id, class_id, role)
     VALUES ($1, $2, $3)`,
    [userId, classId, role]
  );
}

export async function findEnrolledClasses(userId) {
  const result = await db.query(
    `
    SELECT
      c.id,
      c.title,
      c.description,
      c.teacher_id,
      u.username AS teacher_name,
      e.role AS enrollment_role,
      CASE WHEN c.teacher_id = $1 THEN true ELSE false END AS is_owner
    FROM enrollments e
    JOIN classes c ON c.id = e.class_id
    JOIN users u ON u.id = c.teacher_id
    WHERE e.user_id = $1
    ORDER BY c.created_at DESC
    `,
    [userId]
  );
  return result.rows;
}

export async function findClassDetails(classId, userId) {
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
    [classId, userId]
  );
  return result.rows[0] || null;
}

export async function checkEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT role FROM enrollments WHERE class_id = $1 AND user_id = $2`,
    [classId, userId]
  );
  return result.rows[0] || null;
}

export async function findClassPeople(classId) {
  const result = await db.query(
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
    [classId]
  );
  return result.rows;
}

export async function findClasswork(classId) {
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
    [classId]
  );
  return result.rows;
}

export async function createClasswork(classId, title, description, resourceUrl, uploadedBy) {
  const result = await db.query(
    `
    INSERT INTO classwork
      (class_id, title, description, resource_url, uploaded_by)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING id, title, description, resource_url, created_at
    `,
    [classId, title, description || null, resourceUrl || null, uploadedBy]
  );
  return result.rows[0];
}

export async function deleteClasswork(classworkId, classId) {
  const result = await db.query(
    `DELETE FROM classwork WHERE id = $1 AND class_id = $2 RETURNING id`,
    [classworkId, classId]
  );
  return result.rowCount > 0;
}

export async function findClassById(classId) {
  const result = await db.query(`SELECT id FROM classes WHERE id = $1`, [classId]);
  return result.rows[0] || null;
}

export async function isClassOwner(classId, userId) {
  const result = await db.query(
    `SELECT 1 FROM classes WHERE id = $1 AND teacher_id = $2`,
    [classId, userId]
  );
  return result.rowCount > 0;
}

export async function deleteEnrollment(userId, classId) {
  const result = await db.query(
    `DELETE FROM enrollments WHERE user_id = $1 AND class_id = $2`,
    [userId, classId]
  );
  return result.rowCount > 0;
}
