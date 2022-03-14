import { Request, Response, Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

import { initDatabase, UsersStorage } from "../storage";

type RegisterRequest = Request<
  {},
  {},
  { accessToken: string; refreshToken: string }
>;

let usersStorage: UsersStorage;
const router = Router();
initDatabase().then((dbClient) => (usersStorage = new UsersStorage(dbClient)));

router.post("/register/", async (req: RegisterRequest, res: Response) => {
  const { accessToken, refreshToken } = req.body;
  if (!accessToken || !refreshToken) {
    return res.sendStatus(400);
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
  });
  spotifyApi.setAccessToken(accessToken);

  try {
    const { body: user } = await spotifyApi.getMe();
    await usersStorage.addNewUser(accessToken, refreshToken, user.id);

    return res.sendStatus(201);
  } catch (err) {
    return res.sendStatus(401);
  }
});

export { router };
