# Operations

This document captures operational practices that can be defined in-repository without assuming a specific cloud provider.

## Health Endpoints

Implemented endpoints:

- `GET /health`: process-level health response.
- `GET /live`: liveness response for container/runtime health checks.
- `GET /ready`: readiness response that verifies database connectivity with Prisma.

Use `/live` for container liveness checks and `/ready` for dependency-aware readiness checks.

## Graceful Shutdown

`src/server.ts` handles `SIGTERM` and `SIGINT`.

On shutdown, the server:

- Stops accepting new connections.
- Disconnects Prisma.
- Exits with a non-zero status if shutdown fails or times out.

## Logging

Implemented:

- Request IDs.
- Request logging outside tests.
- Shared logger and centralized error handling.
- Startup and shutdown logging.

Not implemented:

- External log aggregation.
- Error monitoring SaaS integration.
- Metrics backend.
- Alert routing.

## Database Backups

Backup automation is not implemented because production database ownership and hosting are not defined.

For PostgreSQL, a typical logical backup command is:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=backup.dump
```

A typical restore command is:

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" backup.dump
```

Run restore tests in a non-production environment before relying on any backup strategy.

## Rollback

Application rollback should be handled by the deployment platform or container orchestrator after one is selected.

Recommended approach:

- Deploy immutable build artifacts or Docker image tags.
- Keep the previous successful artifact available.
- Roll back application code first when possible.
- Treat Prisma migrations as forward-only by default.
- Design corrective migrations instead of assuming automatic schema rollback.

## Monitoring and Alerting

Deferred until infrastructure is selected.

Recommended signals:

- Process uptime.
- HTTP request rate, latency, and error rate.
- Database connectivity and query latency.
- Authentication failure patterns.
- Rate-limit events.
- Container restarts.
- Disk and backup health.
