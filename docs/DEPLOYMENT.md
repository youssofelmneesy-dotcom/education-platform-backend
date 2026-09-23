# Deployment

This document describes the deployment state that exists in the repository and the production infrastructure that is still recommended before operating the backend in a real production environment.

## Current Implementation

The backend is a Node.js application built from TypeScript and started from the compiled output.

Implemented runtime pieces:

- Express application entrypoint: `src/app.ts`.
- Server startup: `src/server.ts`.
- Build command: `npm run build`.
- Start command: `npm run start`.
- Environment validation: `src/config/env.ts`.
- Prisma Client setup: `src/database/prisma.ts`.
- PostgreSQL datasource through Prisma.
- Helmet, CORS, compression, request id, request logging, rate limiting, not-found handling, and centralized error handling.
- Root health response at `GET /`.
- Swagger UI at `GET /api/docs`.
- Health endpoints at `GET /health`, `GET /live`, and `GET /ready`.
- Graceful shutdown for `SIGTERM` and `SIGINT`.

## Prerequisites

- Node.js and npm.
- PostgreSQL reachable through `DATABASE_URL`.
- Environment variables that pass startup validation.
- Built application output in `dist/`.
- Prisma Client generated before startup.
- Database migrations applied before serving traffic.

## Build and Start

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Apply existing migrations:

```bash
npm run prisma:deploy
```

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## Environment Configuration

Production deployments must provide validated environment variables:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `REQUEST_BODY_LIMIT`
- `URLENCODED_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `TRUST_PROXY`

`JWT_SECRET` must be at least 32 characters.

See [Environment Variables](ENVIRONMENT.md).

## Database Connectivity

The application uses Prisma with PostgreSQL. `DATABASE_URL` must point to the production PostgreSQL database. Migrations should be applied with:

```bash
npm run prisma:deploy
```

No seed script currently exists.

## Docker State

The repository includes:

- `Dockerfile` for the application image.
- `.dockerignore` to keep secrets and local artifacts out of the build context.
- `docker-compose.yml` for local PostgreSQL and Redis infrastructure.
- `docker-compose.test.yml` for test PostgreSQL infrastructure.
- `docker-compose.prod.yml` for local/staging simulation with API and PostgreSQL.

See [Docker](DOCKER.md).

## Redis State

Redis is defined in `docker-compose.yml`, but the application code does not currently validate or read a Redis environment variable. Redis should not be treated as a runtime application dependency until application code integrates it.

## Networking and Reverse Proxy

The Express server listens on `PORT`. In production, place it behind a reverse proxy or platform load balancer.

Current implementation supports `TRUST_PROXY`, which maps to Express `app.set("trust proxy", ...)`.

Recommended production proxy responsibilities:

- TLS termination.
- Domain routing.
- Forwarded header configuration.
- Request size and timeout policy.
- Access logging.

## HTTPS and Domain Configuration

HTTPS is not implemented directly in the Node server. Production HTTPS should be handled by a reverse proxy, managed platform, or load balancer.

Configure `CORS_ORIGINS` with the real frontend origin domains.

## Logging

Request logging is enabled outside the test environment. The shared logger is used by middleware and error handling. The current repository does not include an external log aggregation integration.

## Health Verification

Current health verification:

```text
GET /
GET /health
GET /live
GET /ready
```

`/ready` verifies database connectivity through Prisma.

## Graceful Shutdown

The current `src/server.ts` handles `SIGTERM` and `SIGINT`, closes the HTTP server, disconnects Prisma, and uses a timeout for forced failure if shutdown does not complete.

## Production Security Considerations

Implemented:

- Helmet security headers.
- CORS configuration.
- Global rate limiting outside tests.
- Request body limits.
- Zod validation.
- Centralized error responses.
- bcrypt password hashing.
- Bearer authentication.
- Permission middleware.

Recommended infrastructure:

- Secret manager for `JWT_SECRET` and database credentials.
- TLS everywhere.
- Private database networking.
- Database backups and restore testing.
- External error monitoring.
- Metrics and alerting.
- CI/CD pipeline with quality gates.
