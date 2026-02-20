import express, { json } from "express";
import cors from "cors";
import routes from "./routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  ...(process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim())
    : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : []),
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: Array.from(new Set(allowedOrigins.filter(Boolean))),
    credentials: true,
  }),
);

app.use(json());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
