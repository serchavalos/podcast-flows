import { isAfter } from "date-fns";
import SpotifyWebApi from "spotify-web-api-node";

import { buildFlowMetadata, getDateLimitByInterval } from "./utils";
import { PodcastFlow, PodcastFlowsStorage, TimeInterval } from "../../storage/";
import { SimplifiedSpotifyApi } from "./simplified-spotify-api";
import { PromisedDatabase } from "../promised-sqllite3";

export class PodcastFlowController {
  private username: string;
  private spotifyApi: SimplifiedSpotifyApi;
  private storage: PodcastFlowsStorage;

  constructor(
    username: string,
    api: SpotifyWebApi,
    database: PromisedDatabase
  ) {
    this.username = username;
    this.storage = new PodcastFlowsStorage(database);
    this.spotifyApi = new SimplifiedSpotifyApi(api);
  }

  async addNew(
    flowName: string,
    showIds: string[],
    interval: TimeInterval
  ): Promise<string> {
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
    this.storage.addNewFlow({
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
}
