import { config } from "dotenv";
import express from "express";
import morgan from "morgan";

import { router as apiRouter } from "./routes/api";
import { getAuthRouter } from "./routes/auth";

config();

const port = 8888;
const host = "localhost";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Routes
app.use("/auth", getAuthRouter(host, port, "/auth"));
app.use("/api", apiRouter);

// Initial home page (for now)
app.get("/", (_, res) =>
  res.send('<a href="/auth/login" target="_self">Login</a>')
);

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening http://${host}:${port}`));
