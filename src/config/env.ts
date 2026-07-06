import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number().int().positive(),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string(),

  CORS_ORIGINS: z.string().optional(),

  REQUEST_BODY_LIMIT: z.string().default("1mb"),

  URLENCODED_BODY_LIMIT: z.string().default("1mb"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  TRUST_PROXY: z
    .union([z.literal("true"), z.literal("false"), z.coerce.number().int().nonnegative()])
    .default("false"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
