import { AppError } from "../utils/AppError.js";
import db from "../config/db.js";
import * as assignmentsRepository from "./assignments.repository.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export async function createAssignment(classId, userId, data, file) {
  const enrollment = await assignmentsRepository.checkEnrollment(classId, userId);
  if (!enrollment) {
    throw new AppError(403, "Not enrolled in this class");
  }

  if (enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only class teachers can create assignments");
  }

  let fileUrl = null;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(
      file.buffer,
      file.originalname,
      `assignments/${classId}`
    );
    fileUrl = uploadResult.secure_url || null;
  }

  return assignmentsRepository.createAssignment(
    classId, data.title, data.description, data.submission_type, data.deadline, userId, fileUrl
  );
}

export async function getAssignments(classId, userId) {
  const enrollment = await assignmentsRepository.checkEnrollment(classId, userId);
  if (!enrollment) {
    throw new AppError(403, "You must be enrolled to view assignments");
  }
  return assignmentsRepository.getAssignments(classId, userId);
}

export async function getAssignmentById(assignmentId, classId, userId) {
  const enrollment = await assignmentsRepository.checkEnrollment(classId, userId);
  if (!enrollment) {
    throw new AppError(403, "You must be enrolled to view this assignment");
  }
  
  const assignment = await assignmentsRepository.getAssignmentById(assignmentId, classId);
  if (!assignment) {
    throw new AppError(404, "Assignment not found");
  }
  return assignment;
}

export async function updateAssignment(assignmentId, userId, data) {
  const assignmentInfo = await assignmentsRepository.getAssignmentClassId(assignmentId);
  if (!assignmentInfo) {
    throw new AppError(404, "Assignment not found");
  }

  const enrollment = await assignmentsRepository.checkEnrollment(assignmentInfo.class_id, userId);
  if (!enrollment) {
    throw new AppError(403, "Not enrolled in this class");
  }
  if (enrollment.role !== "TEACHER") {
    throw new AppError(403, "Not allowed to edit assignment");
  }

  return assignmentsRepository.updateAssignment(assignmentId, data.title, data.description, data.deadline);
}

export async function deleteAssignment(assignmentId, userId) {
  const assignmentInfo = await assignmentsRepository.getAssignmentClassId(assignmentId);
  if (!assignmentInfo) {
    throw new AppError(404, "Assignment not found");
  }

  const enrollment = await assignmentsRepository.checkEnrollment(assignmentInfo.class_id, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can delete assignments");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await assignmentsRepository.deleteEvaluationsByAssignment(assignmentId, client);
    await assignmentsRepository.deleteSubmissionsByAssignment(assignmentId, client);
    await assignmentsRepository.deleteAssignmentById(assignmentId, client);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function submitAssignment(assignmentId, userId, data, file) {
  const assignmentInfo = await assignmentsRepository.getAssignmentClassId(assignmentId);
  if (!assignmentInfo) {
    throw new AppError(404, "Assignment not found");
  }

  const enrollment = await assignmentsRepository.checkEnrollment(assignmentInfo.class_id, userId);
  if (!enrollment) {
    throw new AppError(403, "Not enrolled in class");
  }

  let content_url = data.content_url || null;
  let originalFilename = null;

  if (file && file.buffer) {
    originalFilename = file.originalname || null;
    const uploadResult = await uploadBufferToCloudinary(
      file.buffer,
      file.originalname,
      `submissions/${assignmentId}`
    );
    content_url = uploadResult.secure_url || content_url;
  }

  if (assignmentInfo.submission_type === "INDIVIDUAL") {
    const existing = await assignmentsRepository.checkIndividualSubmission(assignmentId, userId);
    if (existing) {
      throw new AppError(409, "Already submitted");
    }
    return assignmentsRepository.createIndividualSubmission(
      assignmentId, userId, content_url, data.content_text, originalFilename
    );
  }

  if (assignmentInfo.submission_type === "GROUP") {
    const groupInfo = await assignmentsRepository.getUserGroup(userId, assignmentInfo.class_id);
    if (!groupInfo) {
      throw new AppError(403, "Not part of any group");
    }
    if (groupInfo.role !== "LEADER") {
      throw new AppError(403, "Only group leader can submit");
    }

    const existing = await assignmentsRepository.checkGroupSubmission(assignmentId, groupInfo.group_id);
    if (existing) {
      throw new AppError(409, "Group already submitted");
    }

    return assignmentsRepository.createGroupSubmission(
      assignmentId, groupInfo.group_id, content_url, data.content_text, originalFilename
    );
  }

  throw new AppError(400, "Invalid submission type");
}
