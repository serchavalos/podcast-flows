import { config } from "dotenv";
import express from "express";
import morgan from "morgan";

import { router as apiRouter } from "./routes/api";
import { router as authRouter } from "./routes/auth";

config();

const port = 8888;
const host = "localhost";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Routes
app.use("/auth", authRouter);
app.use("/api", apiRouter);

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening http://${host}:${port}`));
