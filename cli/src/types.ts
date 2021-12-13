export type Flow = {
  name: string;
  shows: string[];
  // Spotify User's URI
  userUri: string;
  // Spotify Playlist URI
  playlistUri: string;
  createdAt: Date;
  modifiedAt: Date;
  // Refers to the time when the playlist was refreshed
  // with newest episodes
  lastUpdateAt: null | Date;
};
