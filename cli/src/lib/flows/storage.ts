import Conf from 'conf';

import { DataAccess, Flow } from './types';

export class FlowStorage {
  constructor(private dataAccess: DataAccess) {}

  findFlowByName(name: string): null | Flow {
    const podcastFlows = this.dataAccess.get() || [];
    return podcastFlows.find((flow) => flow.name === name) || null;
  }

  findFlowById(flowId: string): null | Flow {
    const podcastFlows = this.dataAccess.get() || [];
    return podcastFlows.find((flow) => flow.playlistId === flowId) || null;
  }

  deleteFlowById(flowId: string): void {
    const flows = this.dataAccess.get() || [];
    const filteredFlows = flows.filter(({ playlistId }) => playlistId !== flowId);
    if (flows.length === filteredFlows.length) {
      throw new Error('Flow not found');
    }
    this.dataAccess.set(filteredFlows);
  }

  getAllFlows(): Flow[] {
    return this.dataAccess.get() || [];
  }

  getFlowsByUserId(userId: string): Flow[] {
    const flows = this.getAllFlows();
    return flows.filter((flow) => flow.userId === userId);
  }

  persist(flow: Flow): void {
    const podcastFlows = this.dataAccess.get() || [];
    const index = podcastFlows.findIndex((f) => f.playlistId === flow.playlistId);
    if (index > -1) {
      podcastFlows[index] = flow;
    } else {
      podcastFlows.push(flow);
    }
    this.dataAccess.set(podcastFlows);
  }
}
