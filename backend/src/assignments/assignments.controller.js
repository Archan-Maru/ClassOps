import * as assignmentsService from "./assignments.service.js";

export async function createAssignment(req, res, next) {
  try {
    const assignment = await assignmentsService.createAssignment(req.params.id, req.user.id, req.body, req.file);
    res.status(201).json({ assignment });
  } catch (err) {
    next(err);
  }
}

export async function getAssignments(req, res, next) {
  try {
    const assignments = await assignmentsService.getAssignments(req.params.id, req.user.id);
    res.status(200).json({ assignments });
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentById(req, res, next) {
  try {
    const assignment = await assignmentsService.getAssignmentById(req.params.assignmentId, req.params.id, req.user.id);
    res.status(200).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function updateAssignment(req, res, next) {
  try {
    const assignment = await assignmentsService.updateAssignment(req.params.assignmentId, req.user.id, req.body);
    res.status(200).json({ assignment });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignment(req, res, next) {
  try {
    await assignmentsService.deleteAssignment(req.params.assignmentId, req.user.id);
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function submitAssignment(req, res, next) {
  try {
    const submission = await assignmentsService.submitAssignment(req.params.assignmentId, req.user.id, req.body, req.file);
    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}
