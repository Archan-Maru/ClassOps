import express, { json } from "express";
import routes from "./routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(json());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
