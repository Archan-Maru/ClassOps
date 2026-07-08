import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as groupsController from "./groups.controller.js";
import { createGroupRules, memberRules } from "./groups.validator.js";

const router = Router();

router.post("/:id/groups", requireAuth, createGroupRules, validate, groupsController.createGroup);
router.get("/:id/available-students", requireAuth, groupsController.getAvailableStudents);
router.post("/groups/:id/members", requireAuth, memberRules, validate, groupsController.addMemberToGroup);
router.post("/groups/:id/leader", requireAuth, memberRules, validate, groupsController.assignLeader);
router.get("/groups/:id/members", requireAuth, groupsController.getGroupMembers);
router.get("/:id/groups", requireAuth, groupsController.getGroupsInClass);
router.delete("/groups/:groupId/members/:userId", requireAuth, groupsController.removeMemberFromGroup);

export default router;
