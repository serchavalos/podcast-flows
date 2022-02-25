import path from "path";
import { PromisedDatabase } from "../lib/promised-sqllite3";

export function initDatabase(): PromisedDatabase {
  const databaseFilePath = path.join(process.cwd(), "./databases/local.db");
  return new PromisedDatabase(databaseFilePath);
}

export { UsersStorage } from "./users";
export {
  PodcastFlowsStorage,
  TIME_INTERVALS,
  TimeInterval,
  PodcastFlow,
} from "./podcast-flows";
