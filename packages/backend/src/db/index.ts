import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Use hardcoded connection config that matches Docker setup
const connectionConfig = {
  host: "localhost",
  port: 5433,
  database: "wagermore",
  user: "postgres",
  password: "postgres",
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(connectionConfig);

export const db = drizzle(pool, { schema });
export { schema };
