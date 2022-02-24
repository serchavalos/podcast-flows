import { Request, Response, NextFunction } from "express";
import SpotifyWebApi from "spotify-web-api-node";

export function getAccessToken(authHeader: string): string | null {
  if (!/^Bearer /.test(authHeader)) {
    return null;
  }
  return authHeader.replace(/^Bearer /, "").trim();
}

export async function bearerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "OPTIONS") {
    return next();
  }
  const accessToken = getAccessToken(req.headers.authorization);
  // Fetch the access token
  if (!accessToken) {
    return res.sendStatus(401);
  }

  try {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    const { body: user } = await spotifyApi.getMe();
    req.user = { username: user.id };
    return next();
  } catch (_) {
    return res.sendStatus(401);
  }
}
