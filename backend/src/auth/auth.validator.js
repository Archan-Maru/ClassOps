import { body } from "express-validator";

export const signupRules = [
  body("email").notEmpty().withMessage("All fields are required"),
  body("username").notEmpty().withMessage("All fields are required"),
  body("password").notEmpty().withMessage("All fields are required"),
  body("role").notEmpty().withMessage("All fields are required"),
  body("role").custom(value => {
    if (!value) return true;
    const normalized = value.toUpperCase();
    if (!["TEACHER", "STUDENT"].includes(normalized)) {
      throw new Error("Invalid role");
    }
    return true;
  })
];

export const loginRules = [
  body("identifier").notEmpty().withMessage("All fields are required"),
  body("password").notEmpty().withMessage("All fields are required"),
];

export const verifyEmailRules = [
  body("otp").notEmpty().withMessage("OTP and email are required"),
  body("email").notEmpty().withMessage("OTP and email are required"),
];

export const resendVerificationRules = [
  body("email").notEmpty().withMessage("Email is required"),
];

export const forgotPasswordRules = [
  body("email").notEmpty().withMessage("Email is required"),
];

export const resetPasswordRules = [
  body("email").notEmpty().withMessage("Email, token, and new password are required"),
  body("token").notEmpty().withMessage("Email, token, and new password are required"),
  body("newPassword").notEmpty().withMessage("Email, token, and new password are required"),
];
