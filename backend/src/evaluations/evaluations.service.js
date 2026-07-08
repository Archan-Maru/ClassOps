import { AppError } from "../utils/AppError.js";
import * as evaluationsRepository from "./evaluations.repository.js";

export async function createEvaluation(submissionId, evaluatorId, data) {
  const submission = await evaluationsRepository.getSubmissionClassAndType(submissionId);
  if (!submission) throw new AppError(404, "Submission not found");

  const enrollment = await evaluationsRepository.checkEnrollment(submission.class_id, evaluatorId);
  if (!enrollment || !["TEACHER", "TA"].includes(enrollment.role)) {
    throw new AppError(403, "Not allowed to evaluate");
  }

  return evaluationsRepository.createEvaluation(submissionId, evaluatorId, data.score, data.feedback);
}

export async function getEvaluations(submissionId, userId) {
  const submission = await evaluationsRepository.getSubmissionClassAndType(submissionId);
  if (!submission) throw new AppError(404, "Submission not found");

  const enrollment = await evaluationsRepository.checkEnrollment(submission.class_id, userId);
  if (!enrollment) throw new AppError(403, "Not allowed");

  return evaluationsRepository.getEvaluations(submissionId);
}

export async function updateEvaluation(evaluationId, userId, data) {
  const evaluation = await evaluationsRepository.getEvaluationById(evaluationId);
  if (!evaluation) throw new AppError(404, "Evaluation not found");

  if (evaluation.evaluator_id !== userId) {
    throw new AppError(403, "Not allowed to edit this evaluation");
  }

  return evaluationsRepository.updateEvaluation(evaluationId, data.score, data.feedback);
}

export async function getEvaluationForAssignment(assignmentId, userId) {
  const assignment = await evaluationsRepository.getAssignmentDetails(assignmentId);
  if (!assignment) throw new AppError(404, "Assignment not found");

  const enrollment = await evaluationsRepository.checkEnrollment(assignment.class_id, userId);
  if (!enrollment) throw new AppError(403, "Not enrolled in class");

  let submissionId = null;
  if (assignment.submission_type === "INDIVIDUAL") {
    submissionId = await evaluationsRepository.getIndividualSubmissionId(assignmentId, userId);
  } else if (assignment.submission_type === "GROUP") {
    submissionId = await evaluationsRepository.getGroupSubmissionId(assignmentId, assignment.class_id, userId);
  }

  if (!submissionId) return null;

  return evaluationsRepository.getEvaluationForSubmission(submissionId);
}
