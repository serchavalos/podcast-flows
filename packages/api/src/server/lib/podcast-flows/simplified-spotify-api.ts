import { isAfter } from "./utils";
import SpotifyWebApi from "spotify-web-api-node";

export class SimplifiedSpotifyApi {
  constructor(private client: SpotifyWebApi) {}

  async getShowsByIds(
    showIds: string[]
  ): Promise<SpotifyApi.ShowObjectSimplified[]> {
    const showResponse = await this.client.getShows(showIds);
    return showResponse.body.shows;
  }

  async createPlaylist(name: string, description: string): Promise<string> {
    const { body: playlist } = await this.client.createPlaylist(name, {
      description,
      collaborative: false,
      public: false,
    });
    return playlist.id;
  }

  async getUserId(): Promise<string> {
    const { body: user } = await this.client.getMe();
    return user.id;
  }

  async getEpisodesUrisFromShowsAfterDate(
    showIds: string[],
    dateLimit: Date
  ): Promise<string[]> {
    const showEpisodesResponse = await Promise.all(
      showIds.map((showId) => this.client.getShowEpisodes(showId))
    );
    const episodes = showEpisodesResponse.reduce(
      (acc: SpotifyApi.EpisodeObjectSimplified[], response) => [
        ...acc,
        ...response.body.items,
      ],
      []
    );

    return episodes.reduce(
      (acc: string[], episode: SpotifyApi.EpisodeObjectSimplified) => {
        const episodeDate = new Date(episode.release_date);
        if (isAfter(episodeDate, dateLimit)) {
          return [...acc, episode.uri];
        }
        return acc;
      },
      []
    );
  }

  async updatePlaylistContent(
    playlistId: string,
    episodesUris: string[]
  ): Promise<void> {
    const playlistTracksResponse = await this.client.getPlaylistTracks(
      playlistId
    );
    const playlistTracks = playlistTracksResponse.body.items
      .filter(({ track }) => !!track)
      .map(({ track }) => ({ uri: track.uri }));

    await Promise.all([
      this.client.removeTracksFromPlaylist(playlistId, playlistTracks),
      this.client.addTracksToPlaylist(playlistId, episodesUris),
    ]);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    // TODO: Review if is acceptable to simply "unfollow" a playlist. Apparently, it is
    // @see https://developer.spotify.com/documentation/general/guides/working-with-playlists/
    await this.client.unfollowPlaylist(playlistId);
  }
}
