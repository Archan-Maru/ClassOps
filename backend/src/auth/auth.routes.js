import { Router } from "express";
import { requireAuth } from "./auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";
import {
  signupRules,
  loginRules,
  verifyEmailRules,
  resendVerificationRules,
  forgotPasswordRules,
  resetPasswordRules,
} from "./auth.validator.js";

const router = Router();

router.post("/signup", signupRules, validate, authController.signup);
router.post("/login", loginRules, validate, authController.login);
router.get("/me", requireAuth, authController.getMe);
router.post("/verify-email", verifyEmailRules, validate, authController.verifyEmail);
router.post("/resend-verification", resendVerificationRules, validate, authController.resendVerification);
router.post("/forgot-password", forgotPasswordRules, validate, authController.forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, authController.resetPassword);

export default router;
