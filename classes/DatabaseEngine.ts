import { Pool } from "pg";

export class DatabaseEngine {
  private client: Pool;

  constructor() {
    if (process.env.POSTGRES_HOST === undefined)
      throw new Error("POSTGRES_HOST is not defined in environment variables.");
    if (process.env.POSTGRES_USER === undefined)
      throw new Error("POSTGRES_USER is not defined in environment variables.");
    if (process.env.POSTGRES_PW === undefined)
      throw new Error("POSTGRES_PW is not defined in environment variables.");
    if (process.env.POSTGRES_DB === undefined)
      throw new Error("POSTGRES_DB is not defined in environment variables.");

    this.client = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PW,
      database: process.env.POSTGRES_DB,
    });
  }

  //FIXME: 타입 정의
  async query(query: string, values?: unknown[]) {
    return await this.client.query(query, values);
  }
}
