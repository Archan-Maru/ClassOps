import multer from "multer";

const storage = multer.memoryStorage();

// 20MB limit
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export default upload;
