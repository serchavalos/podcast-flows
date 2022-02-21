import { PromisedDatabase } from "../lib/promised-sqllite3";

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

export class PodcastFlowsStorage {
  constructor(private db: PromisedDatabase) {
    const timeIntervalCheck = TIME_INTERVALS.map((t) => `'${t}'`).join(", ");
    db.serialize(() => {
      // TODO: Review for better ways to migrate a TS type to a DB schema
      db.run(
        `CREATE TABLE IF NOT EXISTS podcast_flows ( \
          id TEXT PRIMARY KEY, \
          name TEXT NOT NULL, \
          username TEXT NOT NULL, \
          interval VARCHAR(10), \
          createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP, \
          modifiedAt  DATETIME DEFAULT CURRENT_TIMESTAMP, \
          lastUpdateAt  DATETIME DEFAULT NULL, \
          CHECK (interval IN (${timeIntervalCheck})) \
          )`
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS podcast_flows_shows ( \
          podcastFlowID TEXT NOT NULL, \
          showID TEXT NOT NULL \
        )`
      );
    });
  }

  async addNewFlow(
    values: Omit<PodcastFlow, "createdAt" | "modifiedAt" | "lastUpdateAt">
  ): Promise<boolean> {
    const { id, showIds, name, username, interval } = values;
    const flowValuesStatement = [id, name, username, interval]
      .map((i) => `'${i}'`)
      .join(", ");

    try {
      // REVIEW: This is vulnerable to SQL injection attack
      await this.db.asyncRun(
        `INSERT INTO podcast_flows  (id, name, username, interval) VALUES (${flowValuesStatement})`
      );
    } catch (err) {
      throw new Error(`Unable to insert a new podcast flow.\nDetails: ${err}`);
    }
    if (showIds.length > 0) {
      return this.addShowIdsToFlow(id, showIds);
    }
    return true;
  }

  async addShowIdsToFlow(flowId: string, showIds: string[]): Promise<boolean> {
    const showIdsStatement = showIds
      .map((showId) => `('${flowId}','${showId}')`)
      .join(", ");

    try {
      await this.db.asyncRun(
        `INSERT INTO podcast_flows_shows  (podcastFlowID, showID) VALUES ${showIdsStatement}`
      );
    } catch (err) {
      throw new Error(
        `Unable to add show IDs to the flow ID ${flowId}: ${err}`
      );
    }
    return true;
  }

  async getFlowById(flowId: string): Promise<PodcastFlow | null> {
    const [flow, showIds] = (await Promise.all([
      this.db.asyncGet(`SELECT * FROM podcast_flows WHERE id = ?`, [flowId]),
      this.db.asyncGet(
        `SELECT showID FROM podcast_flows_shows WHERE podcastFlowID = ?`,
        [flowId]
      ),
    ])) as [Omit<PodcastFlow, "showIds"> | null, string[]];

    return !flow ? null : { ...flow, showIds };
  }

  async isFlowNameAlreadyRegistered(name: string): Promise<boolean> {
    const row = await this.db.asyncGet(
      `SELECT count(1) AS count FROM podcast_flows WHERE name = ?`,
      [name]
    );
    return row.count > 0;
  }
}
