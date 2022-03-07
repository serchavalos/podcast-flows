import type { PodcastFlow } from "@podcast-flows/api";

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

  private async sendRequest<T>(endpoint: string, method = "GET"): Promise<T> {
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
