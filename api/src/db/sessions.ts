import { Database } from "sqlite3";

type Session = {
  accessToken: string;
  username: string;
  expiresIn: Date;
};

const db = new Database("./sessions.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS sessions ( \
      accessToken TEXT UNIQUE NOT NULL, \
      refreshToken TEXT UNIQUE NOT NULL, \
      username TEXT NOT NULL,\
      expiresIn TIMESTAMP \
    )"
  );
});

export async function getSessionByAccessToken(
  accessToken: string
): Promise<Session | null> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM sessions WHERE accessToken = ?",
      [accessToken],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return resolve(null);
        }
        const { username, expiresIn } = row;

        return resolve({
          accessToken,
          username,
          expiresIn: new Date(expiresIn),
        });
      }
    );
  });
}

export async function registerNewSession(
  accessToken: string,
  refreshToken: string,
  username: string,
  expiresIn: number // express in seconds
): Promise<void> {
  return new Promise((resolve, reject) => {
    const actualExpiresIn = new Date().getTime() + expiresIn * 1000; // transformed to milliseconds
    db.run(
      "INSERT INTO sessions (accessToken, refreshToken, username, expiresIn) VALUES (?, ?, ?, ?)",
      [accessToken, refreshToken, username, actualExpiresIn],
      (_, err) => (err ? reject(err) : resolve())
    );
  });
}

export async function deleteSession(accessToken: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.run(
      "DELETE FROM sessions WHERE accessToken = ?",
      [accessToken],
      (_, err) => (err ? resolve(false) : resolve(true))
    );
  });
}
