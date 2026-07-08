import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import * as submissionsController from "./submissions.controller.js";

const router = Router();

router.get("/user/:id", requireAuth, submissionsController.getUserInfo);

router.post(
  "/:id/submissions",
  requireAuth,
  upload.single("file"),
  submissionsController.submitAssignment
);

router.get("/:id/submission/me", requireAuth, submissionsController.getMySubmission);
router.get("/:id/submissions", requireAuth, submissionsController.getSubmissions);

router.put(
  "/:id",
  requireAuth,
  upload.single("file"),
  submissionsController.updateSubmission
);

router.delete("/:id", requireAuth, submissionsController.deleteSubmission);

router.get("/:assignmentId/submission", requireAuth, submissionsController.getSubmissionStatus);
router.get("/:assignmentId/submissions", requireAuth, submissionsController.getSubmissionsSorted);

export default router;
