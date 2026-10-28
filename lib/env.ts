import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  INQUIRY_HASH_SALT: z.string().min(1),
});

export type ServerEnv = z.infer<typeof envSchema>;

export type EnvResult =
  | { configured: false }
  | ({ configured: true } & ServerEnv);

export function getServerEnv(): EnvResult {
  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    INQUIRY_HASH_SALT: process.env.INQUIRY_HASH_SALT,
  });
  if (!parsed.success) return { configured: false };
  return { configured: true, ...parsed.data };
}
