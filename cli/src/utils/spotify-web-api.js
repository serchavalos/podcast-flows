import open from "open";
import express from "express";
import { stringify } from "querystring";
import SpotifyWebApi from "spotify-web-api-node";
import { generate as generateRandom } from "randomstring";

import { blue } from "./log.js";

const httpPort = 8888;
const redirectUri = `http://localhost:${httpPort}/callback/`;
let server;

function getAuthorizaionCode() {
  return new Promise((resolve) => {
    // Start the server
    const app = express();
    server = app.listen(httpPort);

    // Generate the URL and request the user to visit this address
    const state = generateRandom(16);
    const scope = "playlist-read-collaborative playlist-modify-public";
    const loginURI =
      "https://accounts.spotify.com/authorize?" +
      stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        response_type: "code",
        redirect_uri: redirectUri,
        scope,
        state,
      });

    open(loginURI);
    blue("Waiting for users authorization...");

    // Wait until we get a response from them
    // Return authorization code
    app.get("/callback", async function (req, res) {
      const { code } = req.query;

      res.send(
        `<html><body>You may close this window now<script>window.close()</script></body></html>`
      );
      resolve(code);
    });
  });
}

/**
 * Setup an instance from Spotify Web API by setting up the credentials, authenticating and authorizing
 *
 * @returns SpotifyWebApi instance
 */
export async function createAuthorizedInstance() {
  const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: redirectUri,
  });

  const authCode = await getAuthorizaionCode();
  const credentials = await api.authorizationCodeGrant(authCode);
  api.setAccessToken(credentials.body.access_token);

  return api;
}
