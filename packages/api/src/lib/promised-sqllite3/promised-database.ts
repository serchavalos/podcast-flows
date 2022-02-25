import { Database, RunResult } from "sqlite3";

export class PromisedDatabase extends Database {
  asyncRun(sql: string, params = []): Promise<void> {
    const instance = this;
    const runFunc = super.run;
    return new Promise((resolve, reject) => {
      runFunc.call(instance, sql, params, (err: Error | null): void => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  asyncGet(sql: string, params = []): Promise<any> {
    const instance = this;
    const getFunc = super.get;
    return new Promise((resolve, reject) => {
      getFunc.call(
        instance,
        sql,
        params,
        (err: Error | null, row: RunResult): void => {
          if (err) return reject(err);
          return resolve(row);
        }
      );
    });
  }

  asyncAll(sql: string, params = []): Promise<any> {
    const instance = this;
    const allFunc = super.all;
    return new Promise((resolve, reject) => {
      allFunc.call(
        instance,
        sql,
        params,
        (err: Error | null, row: RunResult): void => {
          if (err) return reject(err);
          return resolve(row);
        }
      );
    });
  }
}
