import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";

import { Sessions } from "../storage/sessions";
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

          const sessions = new Sessions();
          sessions.add(profile.username, accessToken, expiresIn);
          return done(null);
        });
      }
    )
  );

  return {
    initiateSpotifyAuth: () =>
      passport.authenticate("spotify", {
        scope: [
          "user-read-email",
          "user-read-private",
          "playlist-read-collaborative",
          "playlist-modify-public",
          "playlist-modify-private",
          "playlist-read-private",
        ],
      }),
    handleSpotifyCallback: (opts: { failureRedirect: string }) =>
      passport.authenticate("spotify", opts),
  };
}
