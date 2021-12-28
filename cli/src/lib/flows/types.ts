export const TIME_INTERVALS = ['daily', 'weekly', 'monthly'] as const;

export type TimeInterval = typeof TIME_INTERVALS[number];

export type Flow = {
  name: string;
  showIds: string[];
  userId: string;
  playlistId: string;
  interval: TimeInterval;
  createdAt: number;
  modifiedAt: number;
  // Refers to the time when the playlist was refreshed
  // with newest episodes
  lastUpdateAt: null | number;
};
