import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as assignmentsController from "./assignments.controller.js";
import { createAssignmentRules, updateAssignmentRules } from "./assignments.validator.js";

const router = Router();

router.post(
  "/:id/assignments",
  requireAuth,
  upload.single("file"),
  createAssignmentRules,
  validate,
  assignmentsController.createAssignment
);

router.get(
  "/:id/assignments",
  requireAuth,
  assignmentsController.getAssignments
);

router.get(
  "/:id/assignments/:assignmentId",
  requireAuth,
  assignmentsController.getAssignmentById
);

router.patch(
  "/:assignmentId",
  requireAuth,
  updateAssignmentRules,
  validate,
  assignmentsController.updateAssignment
);

router.delete(
  "/:assignmentId",
  requireAuth,
  assignmentsController.deleteAssignment
);

router.post(
  "/:assignmentId/submissions",
  requireAuth,
  upload.single("file"),
  assignmentsController.submitAssignment
);

export default router;
