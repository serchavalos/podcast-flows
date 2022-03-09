import { PromisedDatabase } from "../lib/promised-sqllite3";

type UserRecord = {
  accessToken: string;
  refreshToken: string;
  username: string;
};

export class UsersStorage {
  constructor(private db: PromisedDatabase) {
    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS users ( \
          accessToken TEXT UNIQUE NOT NULL, \
          refreshToken TEXT UNIQUE NOT NULL, \
          username TEXT UNIQUE NOT NULL, \
          createdOn DATETIME DEFAULT CURRENT_TIMESTAMP \
          )"
      );
    });
  }

  async addNewUser(
    accessToken: string,
    refreshToken: string,
    username: string
  ): Promise<void> {
    try {
      await this.db.asyncGet(
        "INSERT INTO users (accessToken, refreshToken, username) VALUES (?, ?, ?)",
        [accessToken, refreshToken, username]
      );
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return; // Ignore it; it's trying to save a duplicated user
      }
      throw err;
    }
  }

  getAllUsers(): Promise<UserRecord[]> {
    return this.db.asyncAll(
      "SELECT username, accessToken, refreshToken FROM users"
    );
  }

  updateTokens(
    username: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    return this.db.asyncRun(
      `UPDATE users SET accessToken = "${accessToken}", refreshToken = "${refreshToken}" WHERE username = ?`,
      username
    );
  }
}
