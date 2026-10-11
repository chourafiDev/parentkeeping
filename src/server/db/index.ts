import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import * as schema from "./schema";

// Neon in production (serverless driver over WebSockets). A local Postgres
// (postgres://localhost…) can't speak that protocol, so dev uses node-postgres.
// Both expose the same Drizzle API.
const url = process.env.DATABASE_URL!;
const isLocal = /^postgres(ql)?:\/\/([^@]*@)?(localhost|127\.0\.0\.1)[:/]/.test(url);

function neonDb() {
  return drizzleNeon({ client: new NeonPool({ connectionString: url }), schema, casing: "snake_case" });
}

export const db: ReturnType<typeof neonDb> = isLocal
  ? (drizzlePg({ client: new PgPool({ connectionString: url }), schema, casing: "snake_case" }) as unknown as ReturnType<typeof neonDb>)
  : neonDb();
