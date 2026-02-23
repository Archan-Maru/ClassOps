import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [type, realId] = id.split("-");

    if (!type || !realId) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    let url = null;

    if (type === "classwork") {
      const result = await db.query(
        "SELECT resource_url FROM classwork WHERE id = $1",
        [realId],
      );
      url = result.rows[0]?.resource_url;
    } else if (type === "assignment") {
      const result = await db.query(
        "SELECT file_url FROM assignments WHERE id = $1",
        [realId],
      );
      url = result.rows[0]?.file_url;
    } else if (type === "submission") {
      const result = await db.query(
        "SELECT content_url FROM submissions WHERE id = $1",
        [realId],
      );
      url = result.rows[0]?.content_url;
    } else {
      return res.status(400).json({ message: "Unknown document type" });
    }

    if (!url) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;
