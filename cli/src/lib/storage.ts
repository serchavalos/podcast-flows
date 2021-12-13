import Conf from 'conf';

import { Flow } from '../types';

export class Storage {
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

  persist(flow: Flow): void {
    const podcastFlows = this.conf.get(this.STORAGE_KEY) || [];
    podcastFlows.push(flow);
    this.conf.set(this.STORAGE_KEY, podcastFlows);
  }
}
