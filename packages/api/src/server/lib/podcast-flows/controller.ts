import { Client } from "pg";
import SpotifyWebApi from "spotify-web-api-node";

import { buildFlowMetadata, getDateLimitByInterval, isAfter } from "./utils";
import { PodcastFlow, PodcastFlowsStorage, TimeInterval } from "../../storage/";
import { SimplifiedSpotifyApi } from "./simplified-spotify-api";

export class PodcastFlowController {
  private username: string;
  private spotifyApi: SimplifiedSpotifyApi;
  private storage: PodcastFlowsStorage;

  constructor(username: string, api: SpotifyWebApi, client: Client) {
    this.username = username;
    this.storage = new PodcastFlowsStorage(client);
    this.spotifyApi = new SimplifiedSpotifyApi(api);
  }

  async addNew(
    flowName: string,
    showIds: string[],
    interval: TimeInterval
  ): Promise<string> {
    if (!flowName || !interval) {
      throw new Error("Missing required parameters");
    }
    if (await this.storage.isFlowNameAlreadyRegistered(flowName)) {
      throw new Error(
        `There is already a flow with this name "${flowName}". Please choose a different one`
      );
    }

    // TODO: Add an `try/catch` block here
    const shows =
      showIds.length > 0 ? await this.spotifyApi.getShowsByIds(showIds) : [];
    const flowMeta = buildFlowMetadata(flowName, interval, shows);

    const [playlistId, username] = await Promise.all([
      this.spotifyApi.createPlaylist(flowMeta.name, flowMeta.description),
      this.spotifyApi.getUserId(),
    ]);
    const flowId = playlistId;

    // 3. Persists in storage
    await this.storage.addNewFlow({
      id: flowId,
      name: flowName,
      showIds: shows.map(({ id }) => id),
      username,
      interval,
    });

    return flowId;
  }

  async getById(flowId: string): Promise<PodcastFlow | null> {
    return this.storage.getFlowById(flowId);
  }

  async getAll(): Promise<PodcastFlow[]> {
    return this.storage.getFlowsByUsername(this.username);
  }

  async delete(flowId: string): Promise<void> {
    try {
      await Promise.all([
        this.storage.deleteFlowById(flowId),
        this.spotifyApi.deletePlaylist(flowId),
      ]);
      return Promise.resolve();
    } catch (err) {
      throw new Error(`Flow with the playlist Id ${flowId} was not found`);
    }
  }

  // TODO: Find a better name; `renew` does not make much sense
  async renew(flowId: string): Promise<void> {
    const flow = await this.storage.getFlowById(flowId);
    if (!flow) {
      throw new Error(`Flow with the playlist Id ${flowId} was not found`);
    }

    const dateLimit = getDateLimitByInterval(flow.interval);
    const lastUpdateMadeOn = flow.lastUpdateAt
      ? new Date(flow.lastUpdateAt)
      : null;
    if (lastUpdateMadeOn && isAfter(lastUpdateMadeOn, dateLimit)) {
      // Flow has recently been updated
      return;
    }

    // Fetch all the episodes of the shows within a given date
    const episodesUris =
      await this.spotifyApi.getEpisodesUrisFromShowsAfterDate(
        flow.showIds,
        dateLimit
      );
    if (!episodesUris.length) {
      // No new content has been published in any of these registered shows
      return;
    }

    // 4. Remove the current episodes of the playlist
    await this.spotifyApi.updatePlaylistContent(flow.id, episodesUris);

    // 5. Update the dates on the flow
    const lastUpdateAt = new Date().getTime();
    return this.storage.editFlow(flow.id, {
      showIds: flow.showIds,
      lastUpdateAt,
    });
  }
}
