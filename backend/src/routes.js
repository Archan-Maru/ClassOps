import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import classRoutes from "./classes/classes.routes.js";
import assignmentsRoutes from "./assignments/assignments.routes.js";
import groupsRoutes from "./groups/groups.routes.js";
import submissionsRoutes from "./submissions/submissions.routes.js";
import evaluationsRoutes from "./evaluations/evaluations.routes.js";
import documentsRoutes from "./documents/documents.routes.js";
import inviteRoutes from "./invites/invites.routes.js";
import aiRoutes from "./ai/ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/classes", classRoutes);
router.use("/classes", assignmentsRoutes);
router.use("/assignments", assignmentsRoutes);
router.use("/classes", groupsRoutes);
router.use("/", groupsRoutes);
router.use("/submissions", submissionsRoutes);
router.use("/evaluations", evaluationsRoutes);
router.use("/documents", documentsRoutes);
router.use("/classes", inviteRoutes);
router.use("/", inviteRoutes);
router.use("/ai", aiRoutes);

export default router;
