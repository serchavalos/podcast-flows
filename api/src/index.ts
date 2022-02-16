import { config } from "dotenv";
import express from "express";
import passport from "passport";
import morgan from "morgan";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import {
  deleteSession,
  getSessionByAccessToken,
  registerNewSession,
} from "./db/sessions";

config();

const port = 8888;
const host = "localhost";
const authCallbackPath = "/auth/spotify/callback/";

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `http://${host}:${port}${authCallbackPath}`,
    },
    (accessToken, refreshToken, expiresIn, profile, done) => {
      process.nextTick(() => {
        registerNewSession(
          accessToken,
          refreshToken,
          profile.username,
          expiresIn
        );
        return done(null);
      });
    }
  )
);
passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const session = await getSessionByAccessToken(token);
      if (!session) {
        return done(null, false);
      }

      // Check if the current session has expired
      const currentTimeMs = new Date().getTime();
      const sessionTimeMs = session.expiresIn.getTime();
      if (currentTimeMs > sessionTimeMs) {
        deleteSession(session.accessToken);
        return done(null, false);
      }

      done(null, session);
    } catch (err) {
      done(err, null);
    }
  })
);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Auth routes
app.get("/", (_, res) => res.send('<a href="/login" target="_self">Login</a>'));
app.get("/login", (_, res) => res.redirect("/auth/spotify/"));
app.get(
  "/auth/spotify/",
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private"],
  })
);
app.get(
  authCallbackPath,
  passport.authenticate("spotify", { failureRedirect: "/" }),
  (_, res) => {
    res.redirect("/");
  }
);

// API routes
app.get(
  "/api/flows",
  passport.authenticate("bearer", {
    session: false,
  }),
  (req, res) => {
    res.json({
      flows: ["muchos", "flows"],
      user: req.user,
    });
  }
);

app.listen(port, () => console.log(`Listening http://${host}:${port}`));
