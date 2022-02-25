// TODO: This should come from the repo `podcast-flows/api`. For now it is copied-pasted
export const TIME_INTERVALS = ["daily", "weekly", "monthly"] as const;
export type TimeInterval = typeof TIME_INTERVALS[number];
export type PodcastFlow = {
  id: string;
  name: string;
  showIds: string[];
  username: string;
  interval: TimeInterval;
  createdAt: number;
  modifiedAt: number;
  // Refers to the time when the playlist was refreshed
  // with newest episodes
  lastUpdateAt: null | number;
};

export class PodcastFlowApi {
  private accessToken: string;
  private baseURL = "http://localhost:8888";
  private endpointPrefix = "/api/podcast-flows";

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public getAllFlows(): Promise<PodcastFlow[]> {
    return this.sendRequest<PodcastFlow[]>(this.endpointPrefix);
  }

  public getFlowById(flowId: string): Promise<PodcastFlow> {
    return this.sendRequest<PodcastFlow>(`${this.endpointPrefix}/${flowId}`);
  }

  public deleteFlow(flowId: string): Promise<void> {
    return this.sendRequest<void>(`${this.endpointPrefix}/${flowId}`, "DELETE");
  }

  private sendRequest<T>(endpoint: string, method = "GET"): Promise<T> {
    if (!this.accessToken) {
      throw new Error(
        "Missing access token; use `PodcastFlowApi.setAccessToken` method"
      );
    }

    return fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    }).then((response) => response.json());
  }
}
