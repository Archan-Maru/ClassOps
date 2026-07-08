import db from "../config/db.js";

export async function getClassworkResourceUrl(id) {
  const result = await db.query("SELECT resource_url FROM classwork WHERE id = $1", [id]);
  return result.rows[0]?.resource_url;
}

export async function getAssignmentFileUrl(id) {
  const result = await db.query("SELECT file_url FROM assignments WHERE id = $1", [id]);
  return result.rows[0]?.file_url;
}

export async function getSubmissionContentUrl(id) {
  const result = await db.query("SELECT content_url FROM submissions WHERE id = $1", [id]);
  return result.rows[0]?.content_url;
}
