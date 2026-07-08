import { AppError } from "../utils/AppError.js";

export default function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, ...err.data });
  }

  res.status(500).json({
    message: "Internal server error",
  });
}
