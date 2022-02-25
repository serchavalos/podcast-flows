import { isAfter } from 'date-fns';
import SpotifyWebApi from 'spotify-web-api-node';

import { buildFlowMetadata, getDateLimitByInterval } from './utils.js';
import { FlowStorage } from './storage.js';
import { DataAccess, Flow, TimeInterval } from './types.js';
import { FlowSpotifyApi } from './spotify-api.js';

export class FlowCollection {
  private userId: string;
  private spotifyApi: FlowSpotifyApi;
  private storage: FlowStorage;

  constructor(userId: string, client: SpotifyWebApi, dataAccess: DataAccess) {
    this.userId = userId;
    this.storage = new FlowStorage(dataAccess);
    this.spotifyApi = new FlowSpotifyApi(client);
  }

  async addNew(flowName: string, showIds: string[], interval: TimeInterval): Promise<string> {
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
    const flowId = playlistId;

    // 3. Persists in storage
    const timestamp = new Date().getTime();
    this.storage.persist({
      id: flowId,
      name: flowName,
      showIds: shows.map(({ id }) => id),
      userId,
      interval,
      createdAt: timestamp,
      modifiedAt: timestamp,
      lastUpdateAt: null,
    });

    return flowId;
  }

  async delete(flowId: string): Promise<void> {
    try {
      this.storage.deleteFlowById(flowId);
    } catch (err) {
      throw new Error(`Flow with the playlist Id ${flowId} was not found`);
    }

    await this.spotifyApi.deletePlaylist(flowId);
  }

  getAll(): Flow[] {
    return this.storage.getFlowsByUserId(this.userId);
  }

  // TODO: Find a better name; `renew` does not make much sense
  async renew(flowId: string): Promise<void> {
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
    if (!episodesUris.length) {
      throw new Error(`No new content has been published in any of these registered shows: ${flow.showIds.join(', ')}`);
    }

    // 4. Remove the current episodes of the playlist
    await this.spotifyApi.updatePlaylistContent(flow.id, episodesUris);

    // 5. Update the dates on the flow
    const timestamp = new Date().getTime();
    this.storage.persist({
      ...flow,
      modifiedAt: timestamp,
      lastUpdateAt: timestamp,
    });
  }
}
