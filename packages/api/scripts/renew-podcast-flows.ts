const SpotifyWebApi = require("spotify-web-api-node");
const { config } = require("dotenv");
const { initDatabase } = require("../src/storage");
const { UsersStorage } = require("../src/storage");
const {
  PodcastFlowController,
} = require("../src/lib/podcast-flows/controller");

config();

// tslint:disable:no-console
const log = (color: string, ...args: any[]) => console.log(color, ...args);
const blue = (...args: any[]) => log("\x1b[34m%s\x1b[0m", ...args);
const red = (...args: any[]) => log("\x1b[31m%s\x1b[0m", ...args);
const green = (...args: any[]) => log("\x1b[32m%s\x1b[0m", ...args);

const db = initDatabase();
const usersStorage = new UsersStorage(db);

function sleepForMs(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function renewAllPodcastFlows(): Promise<void> {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  const users = await usersStorage.getAllUsers();

  blue(
    "Starting renewing process.\nThis will iterate through all the users in the DB"
  );

  for (const user of users) {
    const { username, accessToken, refreshToken } = user;
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    blue(`Current user: ${username}`);
    // Refresh the tokens
    const { statusCode, body } = await spotifyApi.refreshAccessToken();
    if (statusCode !== 200) {
      red(
        `Error while refreshing tokens for user: ${username}\nDetails: ${JSON.stringify(
          body
        )}`
      );
      process.exit(1);
    }
    // save them in the Database
    await usersStorage.updateTokens(
      username,
      body.access_token,
      body.refresh_token
    );
    spotifyApi.setAccessToken(body.access_token);
    spotifyApi.setRefreshToken(body.refresh_token);

    // get all flows for this user
    const controller = new PodcastFlowController(username, spotifyApi, db);
    const flows = await controller.getAll();

    // renew each of the flows
    for (const flow of flows) {
      blue(`Renewing flow ID: ${flow.id} - "${flow.name}"`);
      controller.renew(flow.id);
      await sleepForMs(1000);
    }
  }
  green("Completed! All flows has been renewed :-)");
  process.exit(0);
}

renewAllPodcastFlows();
