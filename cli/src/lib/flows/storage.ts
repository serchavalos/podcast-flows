import Conf from 'conf';

import { Flow } from './types';

export class FlowStorage {
  // `conf` is just a quick way to save data locally. Ideally,
  // we should use Redis or any other serious storage.
  private STORAGE_KEY = 'podcast-flows';
  private conf: Conf<Record<string, Flow[]>>;

  constructor() {
    this.conf = new Conf<Record<string, Flow[]>>();
  }

  findFlowByName(name: string): null | Flow {
    const podcastFlows = this.conf.get(this.STORAGE_KEY) || [];
    return podcastFlows.find((flow) => flow.name === name) || null;
  }

  findFlowById(flowId: string): null | Flow {
    const podcastFlows = this.conf.get(this.STORAGE_KEY) || [];
    return podcastFlows.find((flow) => flow.playlistId === flowId) || null;
  }

  deleteFlowById(flowId: string): void {
    const flows = this.conf.get(this.STORAGE_KEY) || [];
    const filteredFlows = flows.filter(({ playlistId }) => playlistId !== flowId);
    if (flows.length === filteredFlows.length) {
      throw new Error('Flow not found');
    }
    this.conf.set(this.STORAGE_KEY, filteredFlows);
  }

  getAllFlows(): Flow[] {
    return this.conf.get(this.STORAGE_KEY) || [];
  }

  persist(flow: Flow): void {
    const podcastFlows = this.conf.get(this.STORAGE_KEY) || [];
    const index = podcastFlows.findIndex((f) => f.playlistId === flow.playlistId);
    if (index > -1) {
      podcastFlows[index] = flow;
    } else {
      podcastFlows.push(flow);
    }
    this.conf.set(this.STORAGE_KEY, podcastFlows);
  }
}
