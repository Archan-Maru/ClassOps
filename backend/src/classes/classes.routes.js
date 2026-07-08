import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as classesController from "./classes.controller.js";
import { createClassRules, addClassworkRules, joinByCodeRules } from "./classes.validator.js";

const router = Router();

router.post("/", requireAuth, createClassRules, validate, classesController.createClass);
router.get("/me", requireAuth, classesController.getMyClasses);
router.get("/:id", requireAuth, classesController.getClassDetails);
router.get("/:id/people", requireAuth, classesController.getClassPeople);
router.get("/:id/classwork", requireAuth, classesController.getClasswork);
router.post(
  "/:id/classwork",
  requireAuth,
  upload.single("file"),
  addClassworkRules,
  validate,
  classesController.addClasswork
);
router.delete("/:id/classwork/:classworkId", requireAuth, classesController.deleteClasswork);
router.post("/:id/join", requireAuth, classesController.joinClass);
router.post("/join-by-code", requireAuth, joinByCodeRules, validate, classesController.joinClassByCode);
router.delete("/:id/enroll", requireAuth, classesController.unenroll);

export default router;
