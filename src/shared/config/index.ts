import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(), // Optional so builds don't fail without a live DB
  JWT_SECRET: z.string().min(10).optional(), // Optional for builds, validated lazily
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

// We parse process.env once to cast types and provide defaults.
// We DO NOT throw immediately if optional fields are missing so that 
// `npm run build` can succeed without production secrets.
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  // We don't throw here to avoid breaking local generic script execution
}

export const env = parsedEnv.success ? parsedEnv.data : ({} as z.infer<typeof envSchema>);

/**
 * Validates that a required environment variable is present at runtime.
 * Use this right before connecting to a database or signing a JWT.
 */
export function requireEnv(key: keyof z.infer<typeof envSchema>): string {
  const value = env[key];
  if (!value) {
    throw new Error(`CRITICAL: Environment variable ${key} is missing.`);
  }
  return value;
}
