import subDays from 'date-fns/subDays/index.js';

import { TimeInterval } from './types';

type FlowMetadata = {
  name: string;
  description: string;
};

export function buildFlowMetadata(
  flowName: string,
  interval: string,
  shows: SpotifyApi.ShowObjectSimplified[],
): FlowMetadata {
  const showLinks = shows
    .map(({ name, external_urls: { spotify: href } }) => `<a href="${href}">${name}</a>`)
    .join(', ');
  return {
    name: `Flow: ${flowName}`,
    description: `This is flow is subscribed to these shows ${showLinks} and it is updated ${interval}`,
  };
}

export function getDateLimitByInterval(interval: TimeInterval, inputDate: Date = new Date()): Date {
  const amount = interval === 'daily' ? 2 : interval === 'weekly' ? 8 : 31; // Gives an extra day to not be to precise
  return subDays(inputDate, amount);
}
