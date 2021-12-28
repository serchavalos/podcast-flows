import { isAfter } from 'date-fns';
import SpotifyWebApi from 'spotify-web-api-node';

import { buildFlowMetadata, getDateLimitByInterval } from './utils.js';
import { FlowStorage } from './storage.js';
import { Flow, TimeInterval } from './types.js';
import { FlowSpotifyApi } from './spotify-api.js';

export class FlowController {
  private spotifyApi: FlowSpotifyApi;
  private storage: FlowStorage;

  constructor(private client: SpotifyWebApi) {
    this.storage = new FlowStorage();
    this.spotifyApi = new FlowSpotifyApi(client);
  }

  async createFlow(flowName: string, showIds: string[], interval: TimeInterval): Promise<string> {
    // 1. Are there any flows with this name?
    //    Yes, then throw an exception
    if (this.storage.findFlowByName(flowName) !== null) {
      throw new Error(`There is already a flow with this name "${flowName}". Please choose a different one`);
    }

    // TODO: Add an `try/catch` block here
    const shows = await this.spotifyApi.getShowsByIds(showIds);
    const flowMeta = buildFlowMetadata(flowName, interval, shows);

    const [playlistId, userId] = await Promise.all([
      this.spotifyApi.createPlaylist(flowMeta.name, flowMeta.description),
      this.spotifyApi.getUserId(),
    ]);

    // 3. Persists in storage
    const timestamp = new Date().getTime();
    this.storage.persist({
      name: flowName,
      showIds: shows.map(({ id }) => id),
      userId,
      playlistId,
      interval,
      createdAt: timestamp,
      modifiedAt: timestamp,
      lastUpdateAt: null,
    });

    return playlistId;
  }

  async renew(flowId: string): Promise<void> {
    // Check if the flow Id exist
    const flow = this.storage.findFlowById(flowId);
    if (!flow) {
      throw new Error(`Flow with the playlist Id ${flowId} was not found`);
    }

    const dateLimit = getDateLimitByInterval(flow.interval);
    const lastUpdateMadeOn = flow.lastUpdateAt ? new Date(flow.lastUpdateAt) : null;
    if (lastUpdateMadeOn && isAfter(lastUpdateMadeOn, dateLimit)) {
      throw new Error('Flow has recently been updated');
    }

    // Fetch all the episodes of the shows within a given date
    const episodesUris = await this.spotifyApi.getEpisodesUrisFromShowsAfterDate(flow.showIds, dateLimit);

    // 4. Remove the current episodes of the playlist
    await this.spotifyApi.updatePlaylistContent(flow.playlistId, episodesUris);

    // 5. Update the dates on the flow
    const timestamp = new Date().getTime();
    this.storage.persist({
      ...flow,
      modifiedAt: timestamp,
      lastUpdateAt: timestamp,
    });
  }

  async delete(flowId: string): Promise<void> {
    try {
      this.storage.deleteFlowById(flowId);
    } catch (err) {
      throw new Error(`Flow with the playlist Id ${flowId} was not found`);
    }

    await this.spotifyApi.deletePlaylist(flowId);
  }

  getAllFlows(): Flow[] {
    return this.storage.getAllFlows();
  }
}
