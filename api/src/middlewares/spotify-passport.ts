import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";

import { initDatabase, UsersStorage } from "../storage";

export function getSpotifyPassportMiddleware(callbackURL: string) {
  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL,
      },
      (accessToken, refreshToken, expiresIn, profile, done) => {
        process.nextTick(() => {
          const db = initDatabase();
          const storage = new UsersStorage(db);
          storage.addNewUser(accessToken, refreshToken, profile.username);
          return done(null);
        });
      }
    )
  );

  return {
    initiateSpotifyAuth: () =>
      passport.authenticate("spotify", {
        scope: ["user-read-email", "user-read-private"],
      }),
    handleSpotifyCallback: (opts: { failureRedirect: string }) =>
      passport.authenticate("spotify", opts),
  };
}
