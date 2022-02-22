import { Request, Response, NextFunction } from "express";

import { Sessions } from "../storage/sessions";

function getBearerToken(authHeader: string): string | null {
  if (!/^Bearer /.test(authHeader)) {
    return null;
  }
  return authHeader.replace(/^Bearer /, "").trim();
}

export function getBearerMiddleware() {
  const sessions = new Sessions();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Fetch the access token
    const accessToken = getBearerToken(req.headers.authorization);
    if (!accessToken) {
      return res.sendStatus(401);
    }

    // Obtain the access token from our session storage
    // (The expiry time is not verified since the sessions are automatically deleted)
    const currentUser = await sessions.get(accessToken);
    if (!currentUser) {
      return res.sendStatus(401);
    }
    // Create a new object to avoid having the reference
    req.user = { ...currentUser };
    return next();
  };
}
