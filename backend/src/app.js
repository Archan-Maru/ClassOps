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
  "https://classops-frontend.onrender.com",
];

const uniqueAllowedOrigins = [...new Set(allowedOrigins.filter(Boolean))];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl/Postman) and known frontend origins.
      if (!origin || uniqueAllowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(json());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
