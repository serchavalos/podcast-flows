import { Router } from "express";

import { getSpotifyPassportMiddleware } from "../middlewares/spotify-passport";

export function getAuthRouter(
  host: string,
  port: number,
  routePrefix = "/auth"
) {
  const router = Router();
  const callbackPath = `/spotify/callback/`;
  const { initiateSpotifyAuth, handleSpotifyCallback } =
    getSpotifyPassportMiddleware(
      `http://${host}:${port}${routePrefix}${callbackPath}`
    );

  router.get("/login/", (_, res) => res.redirect("/auth/spotify/"));
  router.get("/spotify/", initiateSpotifyAuth());
  router.get(
    callbackPath,
    handleSpotifyCallback({ failureRedirect: "/" }),
    (_, res) => {
      res.redirect("/");
    }
  );

  return router;
}
