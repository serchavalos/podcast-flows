import { Client } from "pg";

export enum TimeInterval {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

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
  constructor(private client: Client) {}

  async addNewFlow(
    values: Omit<PodcastFlow, "createdAt" | "modifiedAt" | "lastUpdateAt">
  ): Promise<void> {
    const { id, showIds, name, username, interval } = values;
    const flowValuesStatement = [id, name, username, interval]
      .map((i) => `'${i}'`)
      .join(", ");

    try {
      // REVIEW: This is vulnerable to SQL injection attack
      await this.client.query(
        `INSERT INTO podcast_flows  (id, name, username, interval) VALUES (${flowValuesStatement})`
      );
    } catch (err) {
      throw new Error(`Unable to insert a new podcast flow.\nDetails: ${err}`);
    }
    if (showIds.length > 0) {
      return this.setShowIdsToFlow(id, showIds);
    }
  }

  async editFlow(
    flowId,
    values: Partial<Omit<PodcastFlow, "id" | "createdAt">>
  ): Promise<void> {
    const { showIds, ...podcastFlowValues } = values;
    const fieldNames = Object.keys(podcastFlowValues).map((name) => {
      if (name.substr(-2) === "At") {
        // Date fields are treated differently
        return `"${name}" = (to_timestamp(${podcastFlowValues[name]} / 1000.0))`;
      }
      return `"${name}" = '${podcastFlowValues[name]}'`;
    });

    try {
      await this.client.query(
        // REVIEW: This is vulnerable to SQL injection attack
        `UPDATE podcast_flows SET ${fieldNames} WHERE id = $1::text`,
        [flowId]
      );
    } catch (err) {
      throw new Error(`Unable to update podcast_flows row.\nDetails: ${err}`);
    }

    if (showIds.length > 0) {
      this.setShowIdsToFlow(flowId, showIds);
    }
  }

  async setShowIdsToFlow(flowId: string, showIds: string[]): Promise<void> {
    try {
      await this.client.query(
        `DELETE FROM podcast_flows_shows WHERE "podcastFlowID" = $1::text`,
        [flowId]
      );
      for (const showId of showIds) {
        await this.client.query(
          `INSERT INTO podcast_flows_shows ("podcastFlowID", "showID") VALUES ($1::text, $2::text)`,
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
    const [flow, showIdRows] = await Promise.all([
      this.client.query<PodcastFlow>(
        `SELECT * FROM podcast_flows WHERE id = $1::text`,
        [flowId]
      ),
      this.client.query<{ showID: string }>(
        `SELECT "showID" FROM podcast_flows_shows WHERE "podcastFlowID" = $1::text`,
        [flowId]
      ),
    ]);

    const showIds = showIdRows.rows.map((row) => row.showID);

    return !flow ? null : { ...flow.rows[0], showIds };
  }

  async getFlowsByUsername(username: string): Promise<PodcastFlow[]> {
    const [flows, showIds] = await Promise.all([
      this.client.query<PodcastFlow>(
        `SELECT * FROM podcast_flows WHERE username = $1::text`,
        [username]
      ),
      this.client.query<{ podcastFlowID: string; showID: string }>(
        `SELECT pfs.*
      FROM podcast_flows AS pf
      JOIN podcast_flows_shows AS pfs ON pf.id = pfs."podcastFlowID"
      WHERE pf.username = $1::text
      ORDER BY pfs."podcastFlowID"`,
        [username]
      ),
    ]);
    const showIdsDict = showIds.rows.reduce(
      (acc, { podcastFlowID, showID }) => {
        if (!acc[podcastFlowID]) {
          acc[podcastFlowID] = [];
        }
        acc[podcastFlowID].push(showID);
        return acc;
      },
      {}
    );

    return flows.rows.map((row) => ({
      ...row,
      showIds: showIdsDict[row.id] || [],
    }));
  }

  async isFlowNameAlreadyRegistered(name: string): Promise<boolean> {
    const result = await this.client.query(
      `SELECT * FROM podcast_flows WHERE name = $1::text`,
      [name]
    );
    return result.rowCount > 0;
  }

  async deleteFlowById(flowId: string): Promise<void> {
    await Promise.all([
      this.client.query(`DELETE FROM podcast_flows WHERE id = $1::text`, [
        flowId,
      ]),
      this.client.query(
        `DELETE FROM podcast_flows_shows WHERE "podcastFlowID" = $1::text`,
        [flowId]
      ),
    ]);
  }
}
