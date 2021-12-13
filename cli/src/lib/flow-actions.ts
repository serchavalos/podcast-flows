import SpotifyWebApi from 'spotify-web-api-node';

import { Storage } from './storage.js';
import { Flow } from '../types.js';

type Opts = {
  shows: string[];
  interval: string[];
};

/**
 * TODO: Find a better name
 */
export class FlowActions {
  constructor(private spotifyWebApi: SpotifyWebApi, private storage: Storage) {}

  async create(name: string, { shows, interval }: Opts) {
    // 1. Are there any flows with this name?
    //    Yes, then throw an exception
    if (this.storage.findFlowByName(name) !== null) {
      throw new Error(`There is already a flow with this name "${name}". Please choose a different one`);
    }

    // 2. Create the playlist on Spotify
    const playlistName = `Flow: ${name}`;
    const playlistDescription = `This is flow is subscribed to these shows, ${shows} and it is updated ${interval}`;
    const { body: playlist } = await this.spotifyWebApi.createPlaylist(playlistName, {
      description: playlistDescription,
      collaborative: true,
      public: false,
    });
    const { body: user } = await this.spotifyWebApi.getMe();

    // 3. Create an Flow Object and add the shows
    const currentDate = new Date();
    const flow: Flow = {
      name,
      shows,
      userUri: user.uri,
      playlistUri: playlist.uri,
      createdAt: currentDate,
      modifiedAt: currentDate,
      lastUpdateAt: null,
    };

    // 4. Persists in storage
    this.storage.persist(flow);

    // 5. Schedule a cron-job
  }
}
