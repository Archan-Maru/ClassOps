import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as invitesController from "./invites.controller.js";
import { sendInvitesRules } from "./invites.validator.js";

const router = Router();

router.post("/:classId/invites", requireAuth, sendInvitesRules, validate, invitesController.sendInvites);
router.get("/:classId/invites", requireAuth, invitesController.getInvites);
router.post("/accept-invite/:token", requireAuth, invitesController.acceptInvite);
router.get("/invite-info/:token", invitesController.getInviteInfo);

export default router;
