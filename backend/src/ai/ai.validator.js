import { body } from "express-validator";

export const chatRules = [
  body("message").isString().notEmpty().withMessage("Message is required")
];
