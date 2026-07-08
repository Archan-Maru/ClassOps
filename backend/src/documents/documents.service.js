import { AppError } from "../utils/AppError.js";
import * as documentsRepository from "./documents.repository.js";

export async function getDocumentUrl(id) {
  const [type, realId] = id.split("-");

  if (!type || !realId) {
    throw new AppError(400, "Invalid document ID format");
  }

  let url = null;

  if (type === "classwork") {
    url = await documentsRepository.getClassworkResourceUrl(realId);
  } else if (type === "assignment") {
    url = await documentsRepository.getAssignmentFileUrl(realId);
  } else if (type === "submission") {
    url = await documentsRepository.getSubmissionContentUrl(realId);
  } else {
    throw new AppError(400, "Unknown document type");
  }

  if (!url) {
    throw new AppError(404, "Document not found");
  }

  return url;
}

export function getSafeFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const rawFilename = pathname.split("/").filter(Boolean).pop() || "document";
    return decodeURIComponent(rawFilename).replace(/"/g, "");
  } catch {
    return "document";
  }
}

export async function fetchDocumentContent(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(502, "Unable to fetch document content");
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || 
    (url.toLowerCase().includes(".pdf") ? "application/pdf" : "application/octet-stream");
    
  return { buffer, contentType };
}
