import { Client } from "pg";
import { TIME_INTERVALS } from "./podcast-flows";

export async function initDatabase(): Promise<Client> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const timeIntervalCheck = TIME_INTERVALS.map((t) => `'${t}'`).join(", ");
  Promise.all([
    // TODO: Review for better ways to migrate a TS type to a DB schema
    client.query(
      `CREATE TABLE IF NOT EXISTS podcast_flows ( \
        id TEXT PRIMARY KEY, \
        name TEXT NOT NULL, \
        username TEXT NOT NULL, \
        interval VARCHAR(10), \
        createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        modifiedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        lastUpdateAt  TIMESTAMP DEFAULT NULL, \
        CHECK (interval IN (${timeIntervalCheck})) \
        )`
    ),

    client.query(
      `CREATE TABLE IF NOT EXISTS podcast_flows_shows ( \
        podcastFlowID TEXT NOT NULL, \
        showID TEXT NOT NULL \
      )`
    ),

    client.query(
      "CREATE TABLE IF NOT EXISTS users ( \
        accessToken TEXT UNIQUE NOT NULL, \
        refreshToken TEXT UNIQUE NOT NULL, \
        username TEXT UNIQUE NOT NULL, \
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
        )"
    ),
  ]);

  return client;
}

export { UsersStorage } from "./users";
export {
  PodcastFlowsStorage,
  TIME_INTERVALS,
  TimeInterval,
  PodcastFlow,
} from "./podcast-flows";
