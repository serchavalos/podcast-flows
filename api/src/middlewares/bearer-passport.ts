import passport from "passport";

import { Strategy as BearerStrategy } from "passport-http-bearer";

import { initDatabase, UsersStorage } from "../storage/index";

export function getBearerPassportMiddleware() {
  const db = initDatabase();
  const storage = new UsersStorage(db);

  passport.use(
    new BearerStrategy(async (token, done) => {
      try {
        // TODO: Add a check for "users" with expired session
        const user = await storage.getByAccessToken(token);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    })
  );

  return passport.authenticate("bearer", {
    session: false,
  });
}
