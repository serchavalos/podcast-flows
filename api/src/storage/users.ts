import { Database } from "sqlite3";

type User = {
  accessToken: string;
  refreshToken: string;
  username: string;
};

export class UsersStorage {
  constructor(private db: Database) {
    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS users ( \
          accessToken TEXT UNIQUE NOT NULL, \
          refreshToken TEXT UNIQUE NOT NULL, \
          username TEXT NOT NULL, \
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
    return new Promise((resolve, reject) => {
      this.db.get(
        "INSERT INTO users (accessToken, refreshToken, username) VALUES (?, ?, ?)",
        [accessToken, refreshToken, username],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async getByAccessToken(accessToken: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE accessToken = ?",
        [accessToken],
        (err, row) => {
          if (err) {
            return reject(err);
          }
          if (!row) {
            return resolve(null);
          }
          const { username, refreshToken } = row;

          return resolve({
            accessToken,
            refreshToken,
            username,
          });
        }
      );
    });
  }
}
