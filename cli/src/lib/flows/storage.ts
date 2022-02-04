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
    return podcastFlows.find((flow) => flow.id === flowId) || null;
  }

  deleteFlowById(flowId: string): void {
    const flows = this.dataAccess.get() || [];
    const filteredFlows = flows.filter(({ id }) => id !== flowId);
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
    const index = podcastFlows.findIndex((f) => f.id === flow.id);
    if (index > -1) {
      podcastFlows[index] = flow;
    } else {
      podcastFlows.push(flow);
    }
    this.dataAccess.set(podcastFlows);
  }
}
