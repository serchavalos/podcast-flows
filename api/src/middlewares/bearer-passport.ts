import passport from "passport";

import { Strategy as BearerStrategy } from "passport-http-bearer";
import { Sessions } from "../storage/sessions";

export function getBearerPassportMiddleware() {
  const sessions = new Sessions();

  passport.use(
    new BearerStrategy(async (token, done) => {
      try {
        const session = await sessions.get(token);
        if (!session) {
          return done(null, false);
        }
        done(null, session);
      } catch (err) {
        done(err, null);
      }
    })
  );

  return passport.authenticate("bearer", {
    session: false,
  });
}
