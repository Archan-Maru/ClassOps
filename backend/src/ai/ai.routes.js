import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import * as aiController from "./ai.controller.js";
import { chatRules } from "./ai.validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  dest: path.join(__dirname, "../../uploads"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const router = Router();

router.post("/chat", requireAuth, upload.single("file"), chatRules, validate, aiController.chat);

export default router;
