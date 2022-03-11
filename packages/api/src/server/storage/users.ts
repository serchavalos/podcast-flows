import { Client } from "pg";

type UserRecord = {
  accessToken: string;
  refreshToken: string;
  username: string;
};

export class UsersStorage {
  constructor(private client: Client) {}

  async addNewUser(
    accessToken: string,
    refreshToken: string,
    username: string
  ): Promise<void> {
    try {
      if (await this.doesUserExist(username)) {
        await this.client.query(
          `UPDATE users SET "accessToken"=$1::text, "refreshToken"=$2::text WHERE username = $3::text`,
          [accessToken, refreshToken, username]
        );
      } else {
        await this.client.query(
          `INSERT INTO users ("accessToken", "refreshToken", username) VALUES ($1::text, $2::text, $3::text)`,
          [accessToken, refreshToken, username]
        );
      }
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return; // Ignore it; it's trying to save a duplicated user
      }
      throw err;
    }
  }

  async getAllUsers(): Promise<UserRecord[]> {
    const result = await this.client.query<UserRecord>(
      `SELECT username, "accessToken", "refreshToken" FROM users`
    );
    return result.rows;
  }

  async updateTokens(
    username: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    await this.client.query(
      `UPDATE users SET "accessToken" = $1::text, "refreshToken" = $2::text WHERE username = $3::text`,
      [accessToken, refreshToken, username]
    );
  }

  private async doesUserExist(username: string): Promise<boolean> {
    const result = await this.client.query(
      "SELECT * FROM users WHERE username = $1::text",
      [username]
    );
    return result.rowCount > 0;
  }
}
