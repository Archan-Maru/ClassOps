import { Router} from "express";
import authRoutes from "./auth/auth.routes.js";
import classRoutes from "./classes/classes.routes.js"
import assignmentsRoutes from "./assignments/assignments.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/classes",classRoutes);
router.use("/classes",assignmentsRoutes);

export default router;
