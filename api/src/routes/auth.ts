import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

import { initDatabase, UsersStorage } from "../storage";
import { Sessions } from "../storage/sessions";

type RegisterRequest = Request<
  {},
  {},
  { accessToken: string; refreshToken: string }
>;
type LoginRequest = Request<{}, {}, { accessToken: string }>;

const router = Router();
const db = initDatabase();
const usersStorage = new UsersStorage(db);
const sessions = new Sessions();

router.post("/register/", async (req: RegisterRequest, res: Response) => {
  const { accessToken, refreshToken } = req.body;
  if (!accessToken || !refreshToken) {
    return res.sendStatus(400);
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);
  try {
    const {
      body: { access_token: newAccessToken, refresh_token: newRefreshToken },
    } = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(newAccessToken);

    const { body: user } = await spotifyApi.getMe();
    await usersStorage.addNewUser(newAccessToken, newRefreshToken, user.id);

    return res.sendStatus(201);
  } catch (err) {
    return res.sendStatus(401);
  }
});

router.post("/login", async (req: LoginRequest, res: Response) => {
  const { accessToken } = req.body;
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    accessToken,
  });
  try {
    const { body: user } = await spotifyApi.getMe();
    sessions.add(user.id, accessToken);
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(400);
  }
});

export { router };
