import db from "../config/db.js";

export async function checkEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT role FROM enrollments WHERE class_id = $1 AND user_id = $2`,
    [classId, userId]
  );
  return result.rows[0] || null;
}

export async function createAssignment(classId, title, description, submissionType, deadline, userId, fileUrl) {
  const result = await db.query(
    `
    INSERT INTO assignments
      (class_id, title, description, submission_type, deadline, uploaded_by, file_url)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id, title, description, submission_type, deadline, created_at, file_url
    `,
    [classId, title, description || null, submissionType, deadline, userId, fileUrl]
  );
  return result.rows[0];
}

export async function getAssignments(classId, userId) {
  const result = await db.query(
    `
    SELECT
      a.id,
      a.title,
      a.description,
      a.submission_type,
      a.deadline,
      a.created_at,
      CASE
        WHEN a.submission_type = 'GROUP' AND gs.id IS NOT NULL THEN 'Submitted'
        WHEN a.submission_type = 'INDIVIDUAL' AND us.id IS NOT NULL THEN 'Submitted'
        ELSE 'Not Submitted'
      END AS status
    FROM assignments a
    LEFT JOIN submissions us
      ON us.assignment_id = a.id AND us.user_id = $2
    LEFT JOIN group_members gm
      ON gm.user_id = $2
    LEFT JOIN submissions gs
      ON gs.assignment_id = a.id AND gs.group_id = gm.group_id
    WHERE a.class_id = $1
    ORDER BY a.created_at DESC
    `,
    [classId, userId]
  );
  return result.rows;
}

export async function getAssignmentById(assignmentId, classId) {
  const result = await db.query(
    `
    SELECT id, title, description, submission_type, deadline, created_at
    FROM assignments
    WHERE id = $1 AND class_id = $2
    `,
    [assignmentId, classId]
  );
  return result.rows[0] || null;
}

export async function getAssignmentClassId(assignmentId) {
  const result = await db.query(
    `SELECT class_id, submission_type FROM assignments WHERE id = $1`,
    [assignmentId]
  );
  return result.rows[0] || null;
}

export async function updateAssignment(assignmentId, title, description, deadline) {
  const result = await db.query(
    `
    UPDATE assignments
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      deadline = COALESCE($3, deadline)
    WHERE id = $4
    RETURNING id, title, description, deadline, updated_at
    `,
    [title || null, description || null, deadline || null, assignmentId]
  );
  return result.rows[0];
}

export async function deleteEvaluationsByAssignment(assignmentId, client = db) {
  await client.query(
    `DELETE FROM evaluations WHERE submission_id IN (SELECT id FROM submissions WHERE assignment_id = $1)`,
    [assignmentId]
  );
}

export async function deleteSubmissionsByAssignment(assignmentId, client = db) {
  await client.query(`DELETE FROM submissions WHERE assignment_id = $1`, [assignmentId]);
}

export async function deleteAssignmentById(assignmentId, client = db) {
  await client.query(`DELETE FROM assignments WHERE id = $1`, [assignmentId]);
}

export async function checkIndividualSubmission(assignmentId, userId) {
  const result = await db.query(
    `SELECT 1 FROM submissions WHERE assignment_id = $1 AND user_id = $2`,
    [assignmentId, userId]
  );
  return result.rowCount > 0;
}

export async function createIndividualSubmission(assignmentId, userId, contentUrl, contentText, originalFilename) {
  const result = await db.query(
    `
    INSERT INTO submissions
      (assignment_id, user_id, content_url, content_text, original_filename)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING id, submitted_at
    `,
    [assignmentId, userId, contentUrl || null, contentText || null, originalFilename]
  );
  return result.rows[0];
}

export async function getUserGroup(userId, classId) {
  const result = await db.query(
    `
    SELECT gm.group_id, gm.role
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = $1 AND g.class_id = $2
    `,
    [userId, classId]
  );
  return result.rows[0] || null;
}

export async function checkGroupSubmission(assignmentId, groupId) {
  const result = await db.query(
    `SELECT 1 FROM submissions WHERE assignment_id = $1 AND group_id = $2`,
    [assignmentId, groupId]
  );
  return result.rowCount > 0;
}

export async function createGroupSubmission(assignmentId, groupId, contentUrl, contentText, originalFilename) {
  const result = await db.query(
    `
    INSERT INTO submissions
      (assignment_id, group_id, content_url, content_text, original_filename)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING id, submitted_at
    `,
    [assignmentId, groupId, contentUrl || null, contentText || null, originalFilename]
  );
  return result.rows[0];
}
