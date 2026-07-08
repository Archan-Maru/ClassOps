import * as evaluationsService from "./evaluations.service.js";

export async function createEvaluation(req, res, next) {
  try {
    const evaluation = await evaluationsService.createEvaluation(req.params.id, req.user.id, req.body);
    res.status(201).json({ evaluation });
  } catch (err) {
    next(err);
  }
}

export async function getEvaluations(req, res, next) {
  try {
    const evaluations = await evaluationsService.getEvaluations(req.params.id, req.user.id);
    res.status(200).json({ evaluations });
  } catch (err) {
    next(err);
  }
}

export async function updateEvaluation(req, res, next) {
  try {
    const evaluation = await evaluationsService.updateEvaluation(req.params.id, req.user.id, req.body);
    res.status(200).json({ evaluation });
  } catch (err) {
    next(err);
  }
}

export async function getEvaluationForAssignment(req, res, next) {
  try {
    const evaluation = await evaluationsService.getEvaluationForAssignment(req.params.assignmentId, req.user.id);
    res.status(200).json(evaluation);
  } catch (err) {
    next(err);
  }
}
