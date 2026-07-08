import { body } from "express-validator";

export const sendInvitesRules = [
  body("emails")
    .isArray({ min: 1 }).withMessage("At least one email is required")
    .isArray({ max: 20 }).withMessage("Maximum 20 invites at a time")
];
