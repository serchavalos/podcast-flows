import path from "path";
import { Database } from "sqlite3";

export function initDatabase(): Database {
  const db = new Database(path.join(process.cwd(), "./databases/local.db"));
  return db;
}

export { UsersStorage } from "./users";
