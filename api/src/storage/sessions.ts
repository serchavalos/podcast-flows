import path from "path";
import { CacheContainer } from "node-ts-cache";
import { NodeFsStorage } from "node-ts-cache-storage-node-fs";

type Session = {
  accessToken: string;
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
    expiresIn: number
  ): Promise<void> {
    return this.data.setItem(
      accessToken,
      { accessToken, username },
      { ttl: expiresIn, isLazy: false }
    );
  }
}
