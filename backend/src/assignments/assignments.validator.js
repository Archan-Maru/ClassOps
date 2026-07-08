import { body } from "express-validator";

export const createAssignmentRules = [
  body("title").notEmpty().withMessage("Missing required fields"),
  body("submission_type").notEmpty().withMessage("Missing required fields"),
  body("deadline").notEmpty().withMessage("Missing required fields"),
  body("submission_type").custom(value => {
    if (value && !["INDIVIDUAL", "GROUP"].includes(value)) {
      throw new Error("Invalid submission type");
    }
    return true;
  })
];

export const updateAssignmentRules = [
  body().custom((value, { req }) => {
    if (!req.body.title && !req.body.description && !req.body.deadline) {
      throw new Error("Nothing to update");
    }
    return true;
  })
];
