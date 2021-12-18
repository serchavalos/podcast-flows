import SpotifyWebApi from 'spotify-web-api-node';
import isAfter from 'date-fns/isAfter/index.js';

import { Storage } from './storage.js';
import { Flow, TimeIntervals } from '../types.js';
import { buildFlowMetadata, getDateLimitByInterval } from './flow-utils.js';
import { red } from './log.js';

type Opts = {
  showIds: string[];
  interval: TimeIntervals;
};

/**
 * TODO: Find a better name
 */
export class FlowActions {
  constructor(private spotifyWebApi: SpotifyWebApi, private storage: Storage) {}

  async create(name: string, { showIds, interval }: Opts) {
    // 1. Are there any flows with this name?
    //    Yes, then throw an exception
    if (this.storage.findFlowByName(name) !== null) {
      throw new Error(`There is already a flow with this name "${name}". Please choose a different one`);
    }

    // TODO: Add an `try/catch` block here
    const showResponse = await this.spotifyWebApi.getShows(showIds);
    const shows = showResponse.body.shows.map(({ name: showName, href, uri }) => ({ name: showName, href, uri }));
    const flowMeta = buildFlowMetadata(name, interval, shows);
    const { body: playlist } = await this.spotifyWebApi.createPlaylist(flowMeta.name, {
      description: flowMeta.description,
      collaborative: true,
      public: false,
    });
    const { body: user } = await this.spotifyWebApi.getMe();

    // 3. Create an Flow Object and add the shows
    const currentDate = new Date();
    const flow: Flow = {
      name,
      showUris: shows.map(({ uri }) => uri),
      userUri: user.uri,
      playlistUri: playlist.uri,
      interval,
      createdAt: currentDate,
      modifiedAt: currentDate,
      lastUpdateAt: null,
    };

    // 4. Persists in storage
    this.storage.persist(flow);

    // 5. Schedule a cron-job
  }

  async renew(playlistId: string) {
    // 1. Check if the flow Id exist
    const flow = this.storage.findFlowById(playlistId);
    if (!flow) {
      throw new Error(`Flow with the playlist Id ${playlistId} was not found`);
    }

    // 2. Check the last time that it was updated to avoid refreshing an recently updated playlist

    // 3. Fetch all the episodes of the shows within a given date
    const showIds = flow.showUris.map((showUri) => showUri.split(':').pop() as string);
    const responses = await Promise.all(showIds.map((showId) => this.spotifyWebApi.getShowEpisodes(showId)));
    const dateLimit = getDateLimitByInterval(flow.interval, new Date(2021, 11, 18));
    const episodes = responses.reduce((acc: SpotifyApi.EpisodeObjectSimplified[], response) => {
      return [...acc, ...response.body.items];
    }, []);
    const selectedEpisodesUris = episodes.reduce((acc: string[], episode: SpotifyApi.EpisodeObjectSimplified) => {
      const episodeDate = new Date(episode.release_date);
      if (isAfter(episodeDate, dateLimit)) {
        return [...acc, episode.uri];
      }
      return acc;
    }, []);

    // 4. Remove the current episodes of the playlist

    // 5. Add to the playlists the next episodes
    await this.spotifyWebApi.addTracksToPlaylist(playlistId, selectedEpisodesUris);
  }
}
