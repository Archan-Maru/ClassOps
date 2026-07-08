import { AppError } from "../utils/AppError.js";
import * as submissionsRepository from "./submissions.repository.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export async function getUserInfo(userId) {
  const user = await submissionsRepository.getUserById(userId);
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function submitAssignment(assignmentId, userId, data, file) {
  const assignment = await submissionsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  const enrollment = await submissionsRepository.checkEnrollment(assignment.class_id, userId);
  if (!enrollment) throw new AppError(403, "Not enrolled in class");

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

  if (assignment.submission_type === "INDIVIDUAL") {
    const existing = await submissionsRepository.checkIndividualSubmission(assignmentId, userId);
    if (existing) throw new AppError(409, "Already submitted");

    const submission = await submissionsRepository.createIndividualSubmission(
      assignmentId, userId, content_url, data.content_text, originalFilename
    );
    return { submission, type: "INDIVIDUAL" };
  }

  if (assignment.submission_type === "GROUP") {
    const group = await submissionsRepository.getUserGroup(assignment.class_id, userId);
    if (!group) throw new AppError(403, "Not part of any group");
    if (group.role !== "LEADER") throw new AppError(403, "Only group leader can submit");

    const existing = await submissionsRepository.checkGroupSubmission(assignmentId, group.group_id);
    if (existing) throw new AppError(409, "Already submitted");

    const submission = await submissionsRepository.createGroupSubmission(
      assignmentId, group.group_id, content_url, data.content_text, originalFilename
    );
    return { submission, type: "GROUP", message: "Submitted for entire group" };
  }

  throw new AppError(400, "Invalid submission type");
}

export async function getMySubmission(assignmentId, userId) {
  const assignment = await submissionsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  if (assignment.submission_type === "INDIVIDUAL") {
    return submissionsRepository.getIndividualSubmission(assignmentId, userId);
  }

  const group = await submissionsRepository.getUserGroup(assignment.class_id, userId);
  if (!group) return null;

  return submissionsRepository.getGroupSubmission(assignmentId, group.group_id);
}

export async function getSubmissions(assignmentId, userId) {
  const assignment = await submissionsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  const enrollment = await submissionsRepository.checkEnrollment(assignment.class_id, userId);
  if (!enrollment || !["TEACHER", "TA"].includes(enrollment.role)) {
    throw new AppError(403, "Not allowed");
  }

  return submissionsRepository.getSubmissionsForAssignment(assignmentId);
}

export async function updateSubmission(submissionId, userId, data, file) {
  let content_url = data.content_url || null;

  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(
      file.buffer,
      file.originalname,
      `submissions/${submissionId}`
    );
    content_url = uploadResult.secure_url || content_url;
  }

  let originalFilename = file ? (file.originalname || null) : null;

  const submission = await submissionsRepository.getSubmissionWithAssignment(submissionId);
  if (!submission) throw new AppError(404, "Submission not found");

  if (submission.submission_type === "INDIVIDUAL") {
    if (submission.user_id !== userId) throw new AppError(403, "Not allowed");
  }

  if (submission.submission_type === "GROUP") {
    const isLeader = await submissionsRepository.checkGroupLeader(submission.group_id, userId);
    if (!isLeader) throw new AppError(403, "Only group leader can edit");
  }

  return submissionsRepository.updateSubmission(submissionId, content_url, data.content_text, originalFilename);
}

export async function deleteSubmission(submissionId, userId) {
  const submission = await submissionsRepository.getSubmissionWithAssignment(submissionId);
  if (!submission) throw new AppError(404, "Submission not found");

  if (submission.submission_type === "INDIVIDUAL") {
    if (submission.user_id !== userId) throw new AppError(403, "Not allowed");
  }

  if (submission.submission_type === "GROUP") {
    const isLeader = await submissionsRepository.checkGroupLeader(submission.group_id, userId);
    if (!isLeader) throw new AppError(403, "Only group leader can delete");
  }

  await submissionsRepository.deleteSubmission(submissionId);
}

export async function getSubmissionStatus(assignmentId, userId) {
  const assignment = await submissionsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  const enrollment = await submissionsRepository.checkEnrollment(assignment.class_id, userId);
  if (!enrollment) throw new AppError(403, "Not enrolled in class");

  if (assignment.submission_type === "INDIVIDUAL") {
    const sub = await submissionsRepository.getIndividualSubmission(assignmentId, userId);
    if (!sub) return { exists: false, content: null, submitted_at: null, original_filename: null };
    return {
      exists: true,
      id: sub.id,
      content: sub.content_url || sub.content_text,
      original_filename: sub.original_filename || null,
      submitted_at: sub.submitted_at
    };
  }

  if (assignment.submission_type === "GROUP") {
    const group = await submissionsRepository.getUserGroup(assignment.class_id, userId);
    if (!group) return { exists: false, content: null, submitted_at: null };
    
    const sub = await submissionsRepository.getGroupSubmission(assignmentId, group.group_id);
    if (!sub) return { exists: false, content: null, submitted_at: null, original_filename: null };
    return {
      exists: true,
      id: sub.id,
      content: sub.content_url || sub.content_text,
      original_filename: sub.original_filename || null,
      submitted_at: sub.submitted_at
    };
  }

  return { exists: false, content: null, submitted_at: null };
}

export async function getSubmissionsSorted(assignmentId, userId, sortBy) {
  const assignment = await submissionsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  const enrollment = await submissionsRepository.checkEnrollment(assignment.class_id, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can view submissions");
  }

  return submissionsRepository.getSubmissionsForAssignmentSorted(assignmentId, sortBy);
}
