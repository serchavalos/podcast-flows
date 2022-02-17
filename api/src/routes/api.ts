import { Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

import { getBearerPassportMiddleware } from "../middlewares/bearer-passport";

// TODO: Figure out how to move this to `tsconfig.json`
// So far, `ts-node-dev` is not picking up this override
declare global {
  namespace Express {
    interface User {
      accessToken: string;
    }
  }
}

const router = Router();

router.get("/flows/", getBearerPassportMiddleware(), async (req, res) => {
  const spotifyApiClient = new SpotifyWebApi();

  spotifyApiClient.setAccessToken(req.user.accessToken);
  const { statusCode, body } = await spotifyApiClient.getMe();

  res.json({ statusCode, body });
});

export { router };
