import path from "path";
import { CacheContainer } from "node-ts-cache";
import { NodeFsStorage } from "node-ts-cache-storage-node-fs";

type Session = {
  accessToken: string;
  refreshToken: string;
  username: string;
};

export class Sessions {
  private data: CacheContainer;

  constructor() {
    const sessionFilePath = path.join(
      process.cwd(),
      "./databases/sessions.json"
    );
    this.data = new CacheContainer(new NodeFsStorage(sessionFilePath));
  }
  public get(accessToken: string): Promise<Session> {
    return this.data.getItem(accessToken);
  }

  public add(
    username: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): void {
    this.data.setItem(
      accessToken,
      { accessToken, refreshToken, username },
      { ttl: expiresIn, isLazy: false }
    );
  }
}
