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
  const normalizedDate = new Date(inputDate.getTime());
  normalizedDate.setHours(0, 0, 0, 0);

  if (interval === TimeInterval.DAILY) {
    normalizedDate.setDate(inputDate.getDate() - 1);
  } else if (interval === TimeInterval.WEEKLY) {
    const day = normalizedDate.getDay();
    const newDate = normalizedDate.getDate() - day;
    normalizedDate.setDate(newDate);
  } else if (interval === TimeInterval.MONTHLY) {
    normalizedDate.setMonth(inputDate.getMonth() - 1);
    normalizedDate.setDate(1);
  }
  return normalizedDate;
}

export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}
