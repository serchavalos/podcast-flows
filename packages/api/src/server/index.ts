import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";

import { router as podcastFlowsAPI } from "./routes/podcastFlowsAPI";
import { router as authRouter } from "./routes/auth";

export function createServer(): Express {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("tiny"));

  app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );
    res.setHeader("Access-Control-Max-Age", 86400);
    next();
  });

  // Routes
  app.use("/auth", authRouter);
  app.get("/api/status/", (_: Request, res: Response) => res.send("OK"));
  app.use("/api/podcast-flows/", podcastFlowsAPI);

  return app;
}
