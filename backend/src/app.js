import express, { json } from "express";
import cors from "cors";
import routes from "./routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(json());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
