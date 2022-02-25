import open from 'open';
import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { stringify } from 'querystring';
import { generate as generateRandom } from 'randomstring';

export type UserId = string;
export type Credentials = {
  accessToken: string;
  refreshToken: string;
};

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

    // Wait until we get a response from them
    // Return authorization code
    app.get('/callback', async (req, res) => {
      const { code } = req.query;

      res.send(`<html><body>You may close this window now<script>window.close()</script></body></html>`);
      resolve(code as string);
    });
  });
}

export async function registerNewUser(): Promise<[UserId, Credentials]> {
  const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri,
  });

  const authCode = await getAuthorizaionCode();
  const response = await api.authorizationCodeGrant(authCode);
  const credentials = {
    accessToken: response.body.access_token,
    refreshToken: response.body.refresh_token || '',
  };

  api.setAccessToken(credentials.accessToken);
  api.setRefreshToken(credentials.refreshToken);

  const { body: user } = await api.getMe();

  return [user.id, credentials];
}

export async function initializeClientWithSavedCredentials(credentials: Credentials): Promise<SpotifyWebApi> {
  const client = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  client.setAccessToken(credentials.accessToken);
  client.setRefreshToken(credentials.refreshToken);
  const { body: newCredentials } = await client.refreshAccessToken();
  client.setAccessToken(newCredentials.access_token);
  client.setRefreshToken(newCredentials.refresh_token || '');

  return client;
}
