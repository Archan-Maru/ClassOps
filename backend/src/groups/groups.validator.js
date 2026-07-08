import { body } from "express-validator";

export const createGroupRules = [
  body("name").notEmpty().withMessage("Group name is required"),
];

export const memberRules = [
  body("user_id").notEmpty().withMessage("User id is required"),
];
