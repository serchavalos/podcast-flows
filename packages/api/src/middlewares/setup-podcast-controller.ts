import { Request, Response, NextFunction } from "express";
import SpotifyWebApi from "spotify-web-api-node";

import { getAccessToken } from "./bearer-token";
import { PodcastFlowController } from "../lib/podcast-flows/controller";
import { initDatabase } from "../storage";

export async function setupPodcastFlowControllerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "OPTIONS") {
    return next();
  }

  const dbClient = await initDatabase();
  const { username } = req.user;
  const accessToken = getAccessToken(req.headers.authorization);
  const api = new SpotifyWebApi();
  api.setAccessToken(accessToken);

  res.locals.controller = new PodcastFlowController(username, api, dbClient);
  next();
}
