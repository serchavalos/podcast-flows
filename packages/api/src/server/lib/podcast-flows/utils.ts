import subDays from "date-fns/subDays/index.js";

import { TimeInterval } from "../../storage";

type FlowMetadata = {
  name: string;
  description: string;
};

export function buildFlowMetadata(
  flowName: string,
  interval: string,
  shows: SpotifyApi.ShowObjectSimplified[]
): FlowMetadata {
  const showLinks = shows
    .map(
      ({ name, external_urls: { spotify: href } }) =>
        `<a href="${href}">${name}</a>`
    )
    .join(", ");
  return {
    name: `Flow: ${flowName}`,
    description: showLinks
      ? `This is flow is subscribed to these shows ${showLinks} and it is updated ${interval}`
      : "",
  };
}

export function getDateLimitByInterval(
  interval: TimeInterval,
  inputDate: Date = new Date()
): Date {
  const amount = interval === "daily" ? 1 : interval === "weekly" ? 7 : 30;
  return subDays(inputDate, amount);
}
