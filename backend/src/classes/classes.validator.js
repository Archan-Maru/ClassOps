import { body } from "express-validator";

export const createClassRules = [
  body("title").notEmpty().withMessage("Class title is required"),
];

export const addClassworkRules = [
  body("title").notEmpty().withMessage("Title is required"),
];

export const joinByCodeRules = [
  body("code").notEmpty().withMessage("Class code is required"),
];
