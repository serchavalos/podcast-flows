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
  ): Promise<void> {
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
      return this.setShowIdsToFlow(id, showIds);
    }
  }

  async editFlow(values: Partial<PodcastFlow>): Promise<void> {
    const { id, showIds, lastUpdateAt, ...podcastFlowValues } = values;
    const fieldNames = Object.keys(podcastFlowValues)
      .map((name) => `${name} = "${podcastFlowValues[name]}"`)
      .join(", ");

    try {
      await this.db.asyncRun(
        // REVIEW: This is vulnerable to SQL injection attack
        `UPDATE podcast_flows SET ${fieldNames}, lastUpdateAt = CURRENT_TIMESTAMP WHERE id = ?`,
        id
      );
    } catch (err) {
      throw new Error(`Unable to update podcast_flows row.\nDetails: ${err}`);
    }
    if (showIds.length > 0) {
      this.setShowIdsToFlow(id, showIds);
    }
  }

  async setShowIdsToFlow(flowId: string, showIds: string[]): Promise<void> {
    try {
      await this.db.asyncRun(
        `DELETE FROM podcast_flows_shows WHERE podcastFlowID = ?`,
        flowId
      );
      for (const showId of showIds) {
        await this.db.asyncRun(
          `INSERT INTO podcast_flows_shows (podcastFlowID, showID) VALUES (?, ?)`,
          [flowId, showId]
        );
      }
    } catch (err) {
      throw new Error(
        `Unable to add show IDs to the flow ID ${flowId}: ${err}`
      );
    }
  }

  async getFlowById(flowId: string): Promise<PodcastFlow | null> {
    const [flow, showIdRows] = (await Promise.all([
      this.db.asyncGet(`SELECT * FROM podcast_flows WHERE id = ?`, [flowId]),
      this.db.asyncAll(
        `SELECT showID FROM podcast_flows_shows WHERE podcastFlowID = ?`,
        [flowId]
      ),
    ])) as [Omit<PodcastFlow, "showIds"> | null, { showID: string }[]];
    const showIds = showIdRows.map((row) => row.showID);

    return !flow ? null : { ...flow, showIds };
  }

  async getFlowsByUsername(username: string): Promise<PodcastFlow[]> {
    const [rows, showIds] = await Promise.all([
      this.db.asyncAll(`SELECT * FROM podcast_flows WHERE username = ?`, [
        username,
      ]),
      this.db.asyncAll(
        `SELECT pfs.*
      FROM podcast_flows AS pf
      JOIN podcast_flows_shows AS pfs ON pf.id = pfs.podcastFlowID
      WHERE pf.username = ?
      ORDER BY pfs.podcastFlowID`,
        [username]
      ),
    ]);
    const showIdsDict = showIds.reduce((acc, { podcastFlowID, showID }) => {
      if (!acc[podcastFlowID]) {
        acc[podcastFlowID] = [];
      }
      acc[podcastFlowID].push(showID);
      return acc;
    }, {});

    return rows.map((row) => ({ ...row, showIds: showIdsDict[row.id] || [] }));
  }

  async isFlowNameAlreadyRegistered(name: string): Promise<boolean> {
    const row = await this.db.asyncGet(
      `SELECT count(1) AS count FROM podcast_flows WHERE name = ?`,
      [name]
    );
    return row.count > 0;
  }

  async deleteFlowById(flowId: string): Promise<void> {
    await Promise.all([
      this.db.asyncRun(`DELETE FROM podcast_flows WHERE id = ?`, [flowId]),
      this.db.asyncRun(
        `DELETE FROM podcast_flows_shows WHERE podcastFlowID = ?`,
        [flowId]
      ),
    ]);
  }
}
