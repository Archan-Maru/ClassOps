import fs from "fs";
import path from "path";
import * as aiService from "./ai.service.js";

async function extractFileContent(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".txt") {
    return fs.readFileSync(file.path, "utf-8");
  }

  if (ext === ".pdf") {
    try {
      const pdfParse = await import("pdf-parse");
      const data = fs.readFileSync(file.path);
      const pdf = await pdfParse.default(data);
      return pdf.text.substring(0, 8000);
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

export async function chat(req, res, next) {
  try {
    const { message, conversationHistory } = req.body;
    let fileContent = "";

    if (req.file) {
      try {
        fileContent = await extractFileContent(req.file);
        fs.unlink(req.file.path, () => {});
      } catch (error) {
        console.error("File processing error:", error);
        return res.status(400).json({ error: "Failed to process file: " + error.message });
      }
    }

    const fullMessage = fileContent
      ? "File Content:\n" + fileContent + "\n\nUser Query: " + message
      : message;

    const limitedHistory = conversationHistory
      ? JSON.parse(conversationHistory).slice(-10)
      : [];

    const reply = await aiService.chatWithAI(fullMessage, limitedHistory);

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
}
