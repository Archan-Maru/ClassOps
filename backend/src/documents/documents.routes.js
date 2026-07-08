import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import * as documentsController from "./documents.controller.js";

const router = Router();

router.get("/:id/content", requireAuth, documentsController.getDocumentContent);
router.get("/:id", requireAuth, documentsController.getDocument);

export default router;
