import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as z from "zod";
import * as schema from "./schema";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.number(),
});

export const processEnv = EnvSchema.parse(process.env);

const queryClient = postgres(processEnv.DATABASE_URL);

export const db = drizzle(queryClient, { schema: schema });
