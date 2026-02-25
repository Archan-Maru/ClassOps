import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

async function getDocumentUrl(id) {
  const [type, realId] = id.split("-");

  if (!type || !realId) {
    return { error: { status: 400, message: "Invalid document ID format" } };
  }

  let url = null;

  if (type === "classwork") {
    const result = await db.query("SELECT resource_url FROM classwork WHERE id = $1", [
      realId,
    ]);
    url = result.rows[0]?.resource_url;
  } else if (type === "assignment") {
    const result = await db.query("SELECT file_url FROM assignments WHERE id = $1", [
      realId,
    ]);
    url = result.rows[0]?.file_url;
  } else if (type === "submission") {
    const result = await db.query(
      "SELECT content_url FROM submissions WHERE id = $1",
      [realId],
    );
    url = result.rows[0]?.content_url;
  } else {
    return { error: { status: 400, message: "Unknown document type" } };
  }

  if (!url) {
    return { error: { status: 404, message: "Document not found" } };
  }

  return { url };
}

function getSafeFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const rawFilename = pathname.split("/").filter(Boolean).pop() || "document";
    return decodeURIComponent(rawFilename).replace(/"/g, "");
  } catch {
    return "document";
  }
}

router.get("/:id/content", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getDocumentUrl(id);

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const sourceResponse = await fetch(result.url);
    if (!sourceResponse.ok) {
      return res.status(502).json({ message: "Unable to fetch document content" });
    }

    const sourceContentType = sourceResponse.headers.get("content-type") || "";
    const contentType =
      sourceContentType ||
      (result.url.toLowerCase().includes(".pdf")
        ? "application/pdf"
        : "application/octet-stream");
    const filename = getSafeFilenameFromUrl(result.url);
    const buffer = Buffer.from(await sourceResponse.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getDocumentUrl(id);

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.status(200).json({ url: result.url });
  } catch (err) {
    next(err);
  }
});

export default router;
