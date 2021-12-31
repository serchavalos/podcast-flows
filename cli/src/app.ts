import { Config } from './lib/config.js';
import { FlowCollection } from './lib/flows/collection.js';
import { blue, green, red } from './lib/log.js';
import { Opts } from './types.js';
import { initializeClientWithSavedCredentials, registerNewUser, UserId } from './lib/spotify-api-setup.js';
import SpotifyWebApi from 'spotify-web-api-node';
import { sleepFor } from './lib/utils.js';
import { Flow } from './lib/flows/types.js';

export class Application {
  private config: Config;

  constructor() {
    this.config = new Config();
  }

  async login(): Promise<void> {
    try {
      blue('Waiting for users authorization...');

      const [userId, credentials] = await registerNewUser();
      this.config.setCurrentUser(userId);
      this.config.saveCredentials(userId, credentials);

      green('Congratulations! Now you may proceed creating your first flow');
      process.exit(0);
    } catch (err) {
      red(`Yikes! Something went wrong: ${err}`);
      process.exit(1);
    }
  }

  async createFlow(flowName: string, { showIds, interval }: Opts): Promise<void> {
    const collection = await this.getFlowCollectionOfCurrentUser();

    try {
      const flowId = await collection.addNew(flowName, showIds, interval);
      green(
        `Contragulations!\nYour flow has been succesfully created.\nCheck it out by visiting https://open.spotify.com/playlist/${flowId}`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps... something went wrong: ${err}`);
      process.exit(1);
    }
  }

  async deleteFlow(flowId: string): Promise<void> {
    try {
      const collection = await this.getFlowCollectionOfCurrentUser();
      await collection.delete(flowId);
      green(
        `The flow ID ${flowId} has been deleted.\nYou can still recover the playlist at https://www.spotify.com/se/account/recover-playlists/`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps... something went wrong: ${err}.`);
      process.exit(1);
    }
  }

  async renew(flowId: string): Promise<void> {
    try {
      const collection = await this.getFlowCollectionOfCurrentUser();
      await collection.renew(flowId);
      green(
        `The flow ID ${flowId} has been renewed.\nCheck it out by visiting https://open.spotify.com/playlist/${flowId}`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps... something went wrong: ${err}.`);
      process.exit(1);
    }
  }

  async renewAll(): Promise<void> {
    const collection = await this.getFlowCollectionOfCurrentUser();
    const flows = collection.getAll();
    // a `for` loop is used here to be able to make the requests to Spotify's Web API sequentially
    // If these calls are made in parallel, this client might be blocked by this service for trying to DDoS
    for (let index = 0, limit = flows.length; index < limit; index++) {
      const flowId = flows[index].playlistId;
      try {
        await collection.renew(flowId);
        green(
          `The flow ID ${flowId} has been renewed.\nCheck it out by visiting https://open.spotify.com/playlist/${flowId}`,
        );
        sleepFor(1);
      } catch (err) {
        red(`Oppps... something went wrong:\n${err}.\n Skipping flow: ${flowId}`);
      }
    }
    process.exit(0);
  }

  private async setupSpotifyClient(): Promise<[UserId, SpotifyWebApi]> {
    const userId = this.config.getCurrentUserId();
    const credentials = this.config.getCredentialsByUserId(userId || '');

    if (!userId || !credentials) {
      red(`You need to login first. Run the command "podcast-flows-cli login`);
      process.exit(1);
    }

    const client = await initializeClientWithSavedCredentials(credentials);
    return [userId, client];
  }

  private async getFlowCollectionOfCurrentUser(): Promise<FlowCollection> {
    const dataAccess = {
      get: () => this.config.getFlows(),
      set: (f: Flow[]) => this.config.setFlows(f),
    };
    const [userId, client] = await this.setupSpotifyClient();
    return new FlowCollection(userId, client, dataAccess);
  }
}
