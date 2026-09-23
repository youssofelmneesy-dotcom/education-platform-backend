# Folder Structure

## `src/`

Contains the application source code.

`src/app.ts` builds the Express app, configures global middleware, mounts routers, exposes documentation infrastructure, and registers not-found and error handlers.

`src/server.ts` starts the HTTP server using the validated `PORT` value.

## `src/modules/`

Contains domain modules. Each module owns its HTTP layer, application layer, persistence boundary, validation, and local types.

Implemented modules include:

- `auth`
- `users`
- `profiles`
- `roles`
- `permissions`
- `categories`
- `tags`
- `courses`
- `lessons`
- `lesson-attachments`
- `videos`
- `student-learning`
- `question-bank`
- `assessments`
- `learning-operations`
- `commerce`

Common module subfolders:

- `routes`: Express route definitions and middleware composition.
- `controllers`: HTTP request/response coordination.
- `services`: Application and business behavior.
- `repositories`: Prisma database access.
- `dto`: Request and response data shapes.
- `validators`: Zod schemas.
- `interfaces`: Contracts for controllers, services, or repositories.
- `types`: Module-specific record and helper types.
- `utils`: Module-specific errors or utility functions.
- `middleware`: Module-specific middleware when needed.

## `src/shared/`

Contains reusable infrastructure shared across modules.

- `config`: HTTP runtime configuration.
- `errors`: Base application error classes.
- `middlewares`: Express middleware for validation, request id, request logging, rate limiting, not-found handling, and error handling.
- `utils`: Standard API response helpers, async handler, logger, and shared utility functions.

Shared code should remain generic. Domain-specific behavior belongs in the relevant module.

## `src/config/`

Contains environment validation. `env.ts` loads environment values and validates them with Zod before the application runs.

## `src/database/`

Contains Prisma Client setup. `prisma.ts` exports a Prisma Client instance and reuses it globally outside production to avoid repeated client creation during development and tests.

## `src/docs/`

Contains Swagger/OpenAPI infrastructure. Swagger UI is mounted by the app, but endpoint path documentation is intentionally outside this documentation pass.

## `prisma/`

Contains Prisma schema and migration files.

- `schema.prisma`: Database models, relationships, indexes, constraints, and mappings.
- `migrations/`: Prisma migration history.

No seed file currently exists.

## `tests/`

Contains automated tests.

- `unit/services`: Service unit tests.
- `unit/validators`: Zod validator tests.
- `unit/utils`: Shared utility tests.
- `integration`: Supertest integration tests by module.
- `smoke`: Basic application smoke coverage.
- `performance`: k6 scripts.
- `api`: README for the Newman/Postman API test suite.
- `setup`: Test environment, database reset, and Prisma helpers.

## `docs/`

Contains project documentation. The core implementation documentation lives at the top level of this folder. Historical planning documents remain under `API Design`, `Database Design`, and `System Design`.

## `scripts/`

Contains Node scripts used by package scripts:

- `run-api-tests.mjs`
- `run-performance-tests.mjs`
