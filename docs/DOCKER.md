# Docker

This document describes the Docker assets that exist in the repository and how they should be used.

## Current Docker Files

- `Dockerfile`: production-oriented multi-stage application image.
- `.dockerignore`: excludes local dependencies, build output, test artifacts, docs, Postman files, and environment files from the build context.
- `docker-compose.yml`: local development infrastructure for PostgreSQL and Redis.
- `docker-compose.test.yml`: test PostgreSQL infrastructure.
- `docker-compose.prod.yml`: production/staging-oriented local simulation with API and PostgreSQL.

## Application Image

The Dockerfile:

- Uses Node.js 24 slim images.
- Installs dependencies with `npm ci`.
- Generates Prisma Client during the build.
- Builds TypeScript with `npm run build`.
- Installs only production dependencies in the runtime stage.
- Runs `node dist/server.js`.
- Exposes port `3000`.
- Uses the non-root `node` user.
- Adds a Docker health check against `GET /live`.

Build locally:

```bash
docker build -t education-platform-api:local .
```

## Production-Oriented Compose

`docker-compose.prod.yml` is intended for local or staging simulation. It is not a complete production platform.

It includes:

- API container built from the repository Dockerfile.
- PostgreSQL 17.
- PostgreSQL health check.
- API health check.
- Explicit dependency from API to healthy PostgreSQL.
- Named PostgreSQL data volume.

It does not expose PostgreSQL to the host by default.

Run with a real `.env` file that contains validated application variables and PostgreSQL variables:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Required Compose variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

## Redis

Redis exists in the local development Compose file only.

The application does not currently validate or read Redis configuration and does not use Redis for caching, sessions, rate limiting, queues, OTP storage, or locks. Redis is therefore not included in the production-oriented Compose file.

## Secrets

Do not bake `.env` files, production database URLs, JWT secrets, certificates, or API keys into the image.

`.dockerignore` excludes `.env` and `.env.*` from the build context.
