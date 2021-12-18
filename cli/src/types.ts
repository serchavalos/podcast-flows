export type TimeIntervals = 'daily' | 'weekly' | 'monthly';

export type Flow = {
  name: string;
  showUris: string[];
  // Spotify User's URI
  userUri: string;
  // Spotify Playlist URI
  playlistUri: string;
  interval: TimeIntervals;
  createdAt: Date;
  modifiedAt: Date;
  // Refers to the time when the playlist was refreshed
  // with newest episodes
  lastUpdateAt: null | Date;
};
