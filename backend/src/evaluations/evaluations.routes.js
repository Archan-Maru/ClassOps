import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import * as evaluationsController from "./evaluations.controller.js";

const router = Router();

router.post("/:id/evaluations", requireAuth, evaluationsController.createEvaluation);
router.get("/:id/evaluations", requireAuth, evaluationsController.getEvaluations);
router.put("/:id", requireAuth, evaluationsController.updateEvaluation);
router.get("/:assignmentId/evaluation", requireAuth, evaluationsController.getEvaluationForAssignment);

export default router;
