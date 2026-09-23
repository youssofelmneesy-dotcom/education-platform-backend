# Production Setup

This document separates implemented production-relevant behavior from infrastructure that is still required before operating the backend as a production service.

## Application

Implemented:

- TypeScript build through `npm run build`.
- Application source typecheck through `npm run typecheck:app`.
- Runtime start through `npm run start`.
- `NODE_ENV` validation for `development`, `production`, and `test`.
- Configurable `PORT`.
- Express middleware stack in `src/app.ts`.

Required for production:

- Run with `NODE_ENV=production`.
- Run `npm run build` before `npm run start`.
- Ensure generated Prisma Client is available.
- Use a process manager, container runtime, or hosting platform that restarts failed processes.

## Database

Implemented:

- PostgreSQL datasource in Prisma.
- Prisma schema and migrations.
- Tenant-aware models, relationships, indexes, and constraints.
- Prisma Client singleton setup.

Required for production:

- Production PostgreSQL instance.
- Secure `DATABASE_URL`.
- Migration deployment with `npm run prisma:deploy`.
- Automated backups.
- Restore strategy and restore testing.
- Restricted network access to the database.
- Database monitoring.

## Security

Implemented:

- `JWT_SECRET` validation with a minimum length of 32 characters.
- Configurable CORS origins.
- Helmet middleware.
- Rate limiting outside the test environment.
- Request body limits.
- Zod request validation.
- Centralized error handling that avoids raw unknown error exposure.

Required for production:

- Secret manager or platform-managed secrets.
- Strong unique `JWT_SECRET`.
- HTTPS through reverse proxy or hosting platform.
- Explicit `CORS_ORIGINS`.
- Tuned rate-limit values.
- Review of request body limits for expected workloads.
- Regular dependency auditing.

## Authentication

Implemented:

- Registration with bcrypt password hashing.
- Login with password hash comparison.
- Access token generation.
- Refresh token generation and storage as a hash.
- Refresh token rotation.
- Logout by refresh token revocation.

Required for production:

- Secure token transport over HTTPS.
- Operational policy for token lifetime.
- Monitoring for suspicious login behavior.
- Secret rotation plan.

## Multi-Tenancy

Implemented:

- Tenant model.
- Tenant-aware database relationships.
- Tenant-scoped unique constraints.
- Tenant-aware authorization context.
- `tenantId` in authenticated token payload.

Required for production:

- Tenant provisioning workflow.
- Operational checks to ensure every tenant-owned query remains tenant-scoped.
- Tenant lifecycle policy for activation, deactivation, and deletion.

## Observability

Implemented:

- Request IDs.
- Request logging outside tests.
- Shared logger.
- Central error handling.
- Basic root health response.
- Dedicated health, liveness, and readiness endpoints.
- Graceful shutdown on `SIGTERM` and `SIGINT`.

Required for production:

- Centralized log aggregation.
- Error monitoring.
- Metrics collection.
- Alerts.
- Dashboard for service and database health.

## Infrastructure

Implemented in repository:

- Local PostgreSQL and Redis Compose services.
- Test PostgreSQL Compose service.
- Application Dockerfile.
- Production-oriented Compose simulation with API and PostgreSQL.
- GitHub Actions CI workflow with PostgreSQL service for integration tests.

Not implemented:

- Kubernetes manifests.
- Cloud deployment configuration.
- Backup automation.
- Monitoring integration.

Recommended production infrastructure:

- Reverse proxy or managed load balancer.
- TLS termination.
- Firewall or private network boundaries.
- Managed PostgreSQL or hardened self-managed PostgreSQL.
- Automated deployment pipeline.
- Rollback strategy.
