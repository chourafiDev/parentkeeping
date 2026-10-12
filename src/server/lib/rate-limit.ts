import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

/**
 * Fixed-window limiter stored in the shared `rate_limits` table (the one Better Auth
 * uses, with our own key prefix), so it holds across serverless instances.
 * Returns false when `key` already made `max` calls in the last `windowSeconds`.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number) {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const result = await db.execute<{ count: number }>(sql`
    insert into rate_limits (id, key, count, last_request)
    values (gen_random_uuid()::text, ${key}, 1, ${now})
    on conflict (key) do update set
      count = case when rate_limits.last_request < ${windowStart} then 1 else rate_limits.count + 1 end,
      last_request = case when rate_limits.last_request < ${windowStart} then ${now} else rate_limits.last_request end
    returning count
  `);
  return (result.rows[0]?.count ?? 1) <= max;
}
