import type { CorsOptions } from "cors";

import { env } from "../../config/env.js";

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseTrustProxy(value: typeof env.TRUST_PROXY): boolean | number {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

const allowedOrigins = parseCorsOrigins(env.CORS_ORIGINS);

export const httpConfig = {
  trustProxy: parseTrustProxy(env.TRUST_PROXY),
  requestBodyLimit: env.REQUEST_BODY_LIMIT,
  urlencodedBodyLimit: env.URLENCODED_BODY_LIMIT,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  cors: {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || (allowedOrigins.length === 0 && env.NODE_ENV !== "production")) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  } satisfies CorsOptions,
} as const;
