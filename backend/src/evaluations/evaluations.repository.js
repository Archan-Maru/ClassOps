import db from "../config/db.js";

export async function getSubmissionClassAndType(submissionId) {
  const result = await db.query(
    `
    SELECT s.assignment_id, a.class_id, a.submission_type
    FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = $1
    `,
    [submissionId]
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

export async function createEvaluation(submissionId, evaluatorId, score, feedback) {
  const result = await db.query(
    `
    INSERT INTO evaluations
      (submission_id, evaluator_id, score, feedback)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, score, feedback, created_at
    `,
    [submissionId, evaluatorId, score || null, feedback || null]
  );
  return result.rows[0];
}

export async function getEvaluations(submissionId) {
  const result = await db.query(
    `
    SELECT
      e.id,
      e.score,
      e.feedback,
      e.created_at,
      u.username AS evaluator_name
    FROM evaluations e
    JOIN users u ON u.id = e.evaluator_id
    WHERE e.submission_id = $1
    ORDER BY e.created_at DESC
    `,
    [submissionId]
  );
  return result.rows;
}

export async function getEvaluationById(evaluationId) {
  const result = await db.query(
    `SELECT evaluator_id FROM evaluations WHERE id = $1`,
    [evaluationId]
  );
  return result.rows[0] || null;
}

export async function updateEvaluation(evaluationId, score, feedback) {
  const result = await db.query(
    `
    UPDATE evaluations
    SET score = $1,
        feedback = $2
    WHERE id = $3
    RETURNING id, score, feedback, created_at
    `,
    [score || null, feedback || null, evaluationId]
  );
  return result.rows[0];
}

export async function getAssignmentDetails(assignmentId) {
  const result = await db.query(
    `SELECT id, class_id, submission_type FROM assignments WHERE id = $1`,
    [assignmentId]
  );
  return result.rows[0] || null;
}

export async function getIndividualSubmissionId(assignmentId, userId) {
  const result = await db.query(
    `
    SELECT id FROM submissions
    WHERE assignment_id = $1 AND user_id = $2
    LIMIT 1
    `,
    [assignmentId, userId]
  );
  return result.rows[0]?.id || null;
}

export async function getGroupSubmissionId(assignmentId, classId, userId) {
  const groupResult = await db.query(
    `
    SELECT gm.group_id
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = $1 AND g.class_id = $2
    LIMIT 1
    `,
    [userId, classId]
  );
  if (groupResult.rowCount === 0) return null;
  const groupId = groupResult.rows[0].group_id;

  const result = await db.query(
    `
    SELECT id FROM submissions
    WHERE assignment_id = $1 AND group_id = $2
    LIMIT 1
    `,
    [assignmentId, groupId]
  );
  return result.rows[0]?.id || null;
}

export async function getEvaluationForSubmission(submissionId) {
  const result = await db.query(
    `SELECT score, feedback FROM evaluations WHERE submission_id = $1 LIMIT 1`,
    [submissionId]
  );
  return result.rows[0] || null;
}
