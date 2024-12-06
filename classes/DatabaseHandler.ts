import { Pool } from "pg";

export class DatabaseHandler {
  private client: Pool;

  constructor() {
    this.client = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PW,
      database: process.env.POSTGRES_DB,
    });
  }

  //TODO: Mode complex type handling
  async query(query: string, values: unknown[]) {
    return await this.client.query(query, values);
  }
}
