import subDays from 'date-fns/subDays/index.js';
import { TimeIntervals } from '../types';

type ShowLink = {
  name: string;
  href: string;
};

type FlowMetadata = {
  name: string;
  description: string;
};

export function buildFlowMetadata(flowName: string, interval: string, shows: ShowLink[]): FlowMetadata {
  const showLinks = shows.map(({ name, href }) => `<a href="${href}">${name}</a>`).join(', ');
  return {
    name: `Flow: ${flowName}`,
    description: `This is flow is subscribed to these shows ${showLinks} and it is updated ${interval}`,
  };
}

export function getDateLimitByInterval(interval: TimeIntervals, inputDate: Date = new Date()): Date {
  const amount = interval === 'daily' ? 1 : interval === 'weekly' ? 7 : 30;
  return subDays(inputDate, amount);
}
