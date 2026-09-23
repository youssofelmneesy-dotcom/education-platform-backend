# Environment Variables

Environment variables are loaded in `src/config/env.ts` and validated with Zod at startup. If validation fails, the process exits before the server starts.

Only variables validated by the application are documented here.

| Name | Required | Description | Example |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | Runtime environment. Must be `development`, `production`, or `test`. | `development` |
| `PORT` | Yes | HTTP port used by `src/server.ts`. Must be a positive integer. | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. | `postgresql://postgres:postgres@localhost:5432/education_platform` |
| `JWT_SECRET` | Yes | Secret used to sign and verify access and refresh tokens. Must be at least 32 characters. | `change-me-to-a-32-character-secret` |
| `JWT_EXPIRES_IN` | Yes | Access token lifetime parsed by the Auth service. Supports values such as seconds, minutes, hours, or days. | `1h` |
| `CORS_ORIGINS` | No | Comma-separated list of allowed CORS origins. If omitted outside production, requests without configured origins are allowed by the current CORS logic. | `http://localhost:3000,http://localhost:5173` |
| `REQUEST_BODY_LIMIT` | No | JSON request body size limit. Defaults to `1mb`. | `1mb` |
| `URLENCODED_BODY_LIMIT` | No | URL-encoded request body size limit. Defaults to `1mb`. | `1mb` |
| `RATE_LIMIT_WINDOW_MS` | No | Global rate-limit window in milliseconds. Defaults to 15 minutes. | `900000` |
| `RATE_LIMIT_MAX` | No | Maximum requests allowed during the rate-limit window. Defaults to `100`. | `100` |
| `TRUST_PROXY` | No | Express trust proxy setting. Accepts `true`, `false`, or a non-negative number. Defaults to `false`. | `false` |

## Notes

Redis is present in `docker-compose.yml` for local infrastructure experimentation, but the application does not validate or read Redis configuration. Redis is not part of the current runtime configuration.

`env.test` is used by test scripts and includes values for the dedicated test database and test runtime configuration.
