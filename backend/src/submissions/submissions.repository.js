import db from "../config/db.js";

export async function getUserById(userId) {
  const result = await db.query(`SELECT id, username FROM users WHERE id = $1`, [userId]);
  return result.rows[0] || null;
}

export async function getAssignmentDetails(assignmentId) {
  const result = await db.query(
    `SELECT id, class_id, submission_type FROM assignments WHERE id = $1`,
    [assignmentId]
  );
  return result.rows[0] || null;
}

export async function checkEnrollment(classId, userId) {
  const result = await db.query(
    `SELECT role FROM enrollments WHERE user_id = $1 AND class_id = $2`,
    [userId, classId]
  );
  return result.rows[0] || null;
}

export async function getIndividualSubmission(assignmentId, userId) {
  const result = await db.query(
    `SELECT * FROM submissions WHERE assignment_id = $1 AND user_id = $2`,
    [assignmentId, userId]
  );
  return result.rows[0] || null;
}

export async function getUserGroup(classId, userId) {
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

export async function getGroupSubmission(assignmentId, groupId) {
  const result = await db.query(
    `SELECT * FROM submissions WHERE assignment_id = $1 AND group_id = $2`,
    [assignmentId, groupId]
  );
  return result.rows[0] || null;
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

export async function getSubmissionsForAssignment(assignmentId) {
  const result = await db.query(
    `
    SELECT
      s.id,
      s.user_id,
      s.group_id,
      u.username,
      g.name AS group_name,
      s.content_url,
      s.content_text,
      s.submitted_at,
      e.id AS evaluation_id,
      e.score,
      e.feedback
    FROM submissions s
    LEFT JOIN users u ON u.id = s.user_id
    LEFT JOIN groups g ON g.id = s.group_id
    LEFT JOIN evaluations e ON e.submission_id = s.id
    WHERE s.assignment_id = $1
    ORDER BY s.submitted_at DESC
    `,
    [assignmentId]
  );
  return result.rows;
}

export async function getSubmissionWithAssignment(submissionId) {
  const result = await db.query(
    `
    SELECT s.user_id, s.group_id, a.class_id, a.submission_type
    FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = $1
    `,
    [submissionId]
  );
  return result.rows[0] || null;
}

export async function checkGroupLeader(groupId, userId) {
  const result = await db.query(
    `
    SELECT 1
    FROM group_members
    WHERE group_id = $1 AND user_id = $2 AND role = 'LEADER'
    `,
    [groupId, userId]
  );
  return result.rowCount > 0;
}

export async function updateSubmission(submissionId, contentUrl, contentText, originalFilename) {
  const result = await db.query(
    `
    UPDATE submissions
    SET content_url = $1,
        content_text = $2,
        original_filename = COALESCE($4, original_filename),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, updated_at
    `,
    [contentUrl || null, contentText || null, submissionId, originalFilename]
  );
  return result.rows[0];
}

export async function deleteSubmission(submissionId) {
  await db.query(`DELETE FROM submissions WHERE id = $1`, [submissionId]);
}

export async function getSubmissionsForAssignmentSorted(assignmentId, sortBy) {
  const orderBy = sortBy === "earliest" ? "ASC" : "DESC";
  const result = await db.query(
    `
    SELECT
      s.id,
      s.user_id,
      u.username,
      s.content_url,
      s.content_text,
      s.submitted_at,
      e.id AS evaluation_id,
      e.score,
      e.feedback
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN evaluations e ON e.submission_id = s.id
    WHERE s.assignment_id = $1
    ORDER BY s.submitted_at ${orderBy}
    `,
    [assignmentId]
  );
  return result.rows;
}
