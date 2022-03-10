import { config } from "dotenv";
import express, { Request, Response } from "express";
import morgan from "morgan";

import { router as podcastFlowsAPI } from "./routes/podcastFlowsAPI";
import { router as authRouter } from "./routes/auth";

export { TIME_INTERVALS } from "./storage";
export type { PodcastFlow, TimeInterval } from "./storage";

config();

const port = process.env.PORT || 8888;
const host = process.env.HOST || "localhost";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Routes
app.use("/auth", authRouter);
app.get("/api/status/", (_: Request, res: Response) => res.send("OK"));
app.use("/api/podcast-flows/", podcastFlowsAPI);

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening http://${host}:${port}`));
