import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { chatWithAI } from "./ai.service.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, "../../uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

/**
 * POST /api/ai/chat
 * Send a message to AI and get a response (with optional file attachment)
 */
router.post("/chat", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    let fileContent = "";

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Extract text from uploaded file if present
    if (req.file) {
      try {
        fileContent = await extractFileContent(req.file);
        // Clean up file after reading
        fs.unlink(req.file.path, () => {});
      } catch (error) {
        console.error("File processing error:", error);
        return res
          .status(400)
          .json({ error: "Failed to process file: " + error.message });
      }
    }

    // Combine message with file content
    const fullMessage = fileContent
      ? `File Content:\n${fileContent}\n\nUser Query: ${message}`
      : message;

    // Limit conversation history to last 10 messages for context
    const limitedHistory = conversationHistory
      ? JSON.parse(conversationHistory).slice(-10)
      : [];

    const reply = await chatWithAI(fullMessage, limitedHistory);

    res.json({
      reply,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: error.message || "Failed to process chat message",
    });
  }
});

/**
 * Extract text content from uploaded files
 */
async function extractFileContent(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".txt") {
    return fs.readFileSync(file.path, "utf-8");
  }

  if (ext === ".pdf") {
    // For PDF parsing, you'd need pdf-parse library
    // For now, return a note to install it
    try {
      const pdfParse = await import("pdf-parse");
      const data = fs.readFileSync(file.path);
      const pdf = await pdfParse.default(data);
      return pdf.text.substring(0, 8000); // Limit to first 8000 chars
    } catch (error) {
      console.error("PDF parsing error:", error);
      return "[PDF file detected. Please ensure pdf-parse is installed: npm install pdf-parse]\nContent could not be extracted automatically.";
    }
  }

  if ([".ppt", ".pptx"].includes(ext)) {
    return "[PowerPoint file detected]\nNote: PowerPoint extraction requires manual setup. For now, please:\n1. Convert your PPT to PDF, or\n2. Copy the text content and paste it in the chat\nAlternatively, you can upload a text file with your notes.";
  }

  throw new Error("Unsupported file type");
}

export default router;
