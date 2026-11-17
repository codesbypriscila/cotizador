import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

let cached: z.infer<typeof schema> | undefined;

/** Server env vars, validated once. Throws with a readable list if something is missing. */
export function getServerEnv() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${missing}. Check .env.example.`);
  }
  cached = parsed.data;
  return cached;
}
