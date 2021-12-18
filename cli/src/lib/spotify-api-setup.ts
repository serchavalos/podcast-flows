import open from 'open';
import express from 'express';

import { stringify } from 'querystring';
import SpotifyWebApi from 'spotify-web-api-node';
import { generate as generateRandom } from 'randomstring';

import { blue, green } from './log.js';

const httpPort = 8888;
const redirectUri = `http://localhost:${httpPort}/callback/`;

async function getAuthorizaionCode(): Promise<string> {
  return new Promise((resolve) => {
    // Start the server
    const app = express();
    const erver = app.listen(httpPort);

    // Generate the URL and request the user to visit this address
    const state = generateRandom(16);
    const scope = 'playlist-read-collaborative playlist-modify-public playlist-modify-private playlist-read-private';
    const loginURI =
      'https://accounts.spotify.com/authorize?' +
      stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope,
        state,
      });

    open(loginURI);
    blue('Waiting for users authorization...');

    // Wait until we get a response from them
    // Return authorization code
    app.get('/callback', async (req, res) => {
      const { code } = req.query;

      res.send(`<html><body>You may close this window now<script>window.close()</script></body></html>`);
      resolve(code as string);
    });
  });
}

/**
 * Setup an instance from Spotify Web API by setting up the credentials, authenticating and authorizing
 */
export async function createAuthorizedInstance(): Promise<SpotifyWebApi> {
  const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri,
  });
  const savedCredentials = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
  };

  let credentials;

  if (savedCredentials.access_token && savedCredentials.refresh_token) {
    api.setAccessToken(savedCredentials.access_token);
    api.setRefreshToken(savedCredentials.refresh_token);
    const response = await api.refreshAccessToken();
    credentials = response.body;
  } else {
    const authCode = await getAuthorizaionCode();
    const response = await api.authorizationCodeGrant(authCode);
    credentials = response.body;
    green(`New tokens received!`);
    green(`You may save them in your .env file as:`);
    green(`\`\`\`\nACCESS_TOKEN=${credentials.access_token}\nREFRESH_TOKEN=${credentials.refresh_token}\n\`\`\``);
  }

  api.setAccessToken(credentials.access_token);
  api.setRefreshToken(credentials.refresh_token || '');

  return api;
}
