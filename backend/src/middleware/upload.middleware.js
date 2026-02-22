import multer from "multer";

const storage = multer.memoryStorage();

// moderate default file size limit (20MB)
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export default upload;
