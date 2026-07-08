import * as documentsService from "./documents.service.js";

export async function getDocumentContent(req, res, next) {
  try {
    const { id } = req.params;
    const url = await documentsService.getDocumentUrl(id);
    const { buffer, contentType } = await documentsService.fetchDocumentContent(url);
    const filename = documentsService.getSafeFilenameFromUrl(url);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    return next(err);
  }
}

export async function getDocument(req, res, next) {
  try {
    const { id } = req.params;
    const url = await documentsService.getDocumentUrl(id);
    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
}
