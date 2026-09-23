# Professional Multi-Tenant E-Learning Platform Backend

Production-grade backend for a multi-tenant e-learning platform. The implementation uses Express, TypeScript, Prisma, PostgreSQL, Zod validation, JWT authentication, role-based authorization, and a modular clean architecture.

## Project Overview

The API is organized around education platform domains such as authentication, users, profiles, roles, permissions, categories, tags, courses, lessons, videos, student learning, question bank, assessments, learning operations, lesson attachments, and commerce.

The backend exposes Express routes under `/api`, persists data with Prisma and PostgreSQL, validates incoming request data with Zod, and centralizes shared concerns such as error handling, response formatting, request IDs, logging, CORS, security headers, and rate limiting.

## Key Features

- Modular domain-based backend architecture.
- Authentication with access tokens and refresh tokens.
- Role and permission based authorization.
- Tenant-aware database schema and repository queries.
- Zod request validation for body, params, and query data.
- Prisma repository layer for database access.
- Centralized operational error handling.
- Unit, validator, integration, smoke, API, and performance test infrastructure.
- Security middleware for Helmet, CORS, compression, and rate limiting.
- Swagger UI infrastructure mounted at `/api/docs`.

## Tech Stack

- Runtime: Node.js
- Framework: Express 5
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Authentication: JWT-style HMAC tokens implemented with Node crypto
- Password hashing: bcrypt
- Testing: Vitest, Supertest, k6, Newman runner infrastructure
- Tooling: ESLint, Prettier, tsx

## Project Architecture Overview

The project follows a layered module structure:

```text
HTTP Request
  -> Express route
  -> Middleware
  -> Controller
  -> Service
  -> Repository
  -> Prisma
  -> PostgreSQL
```

Controllers handle HTTP concerns. Services contain application and business rules. Repositories isolate Prisma access. Validators parse and normalize request input before controller logic runs. Shared middleware handles cross-cutting behavior.

See [Architecture](docs/ARCHITECTURE.md) for the full implementation overview.

## Folder Structure Summary

```text
src/
  app.ts
  server.ts
  config/
  database/
  docs/
  modules/
  shared/

prisma/
tests/
docs/
scripts/
```

The main implementation lives in `src/modules`, with each module owning its routes, controllers, services, repositories, DTOs, validators, interfaces, types, and utilities where applicable.

See [Folder Structure](docs/FOLDER_STRUCTURE.md) for responsibility details.

## Prerequisites

- Node.js compatible with the installed TypeScript and dependency versions.
- npm.
- PostgreSQL.
- Docker and Docker Compose are optional for running local PostgreSQL and the test database.
- k6 is required only for `npm run test:performance`.
- Newman is invoked through `npx` by the API test runner. The Postman collection and local environment are stored under `postman/`.

## Installation

```bash
npm install
```

The `prepare` script runs `prisma generate` after installation.

## Environment Setup

Create a local `.env` file based on `.env.example`, then align it with the validated variables documented in [Environment Variables](docs/ENVIRONMENT.md).

Required validated variables include:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Optional validated variables include:

- `CORS_ORIGINS`
- `REQUEST_BODY_LIMIT`
- `URLENCODED_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `TRUST_PROXY`

## Running the Project

Start the development server:

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Run the built server:

```bash
npm run start
```

## Running Tests

Run all configured Vitest tests:

```bash
npm test
```

Run specific suites:

```bash
npm run test:unit
npm run test:integration
npm run test:smoke
npm run test:coverage
```

Run API or performance test runners:

```bash
npm run test:api
npm run test:performance
```

The API test runner uses the Postman collection and local environment stored under `postman/`.

See [Testing Strategy](docs/TESTING_STRATEGY.md).

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the API with `tsx watch`. |
| `npm run build` | Compile TypeScript with `tsc`. |
| `npm run start` | Run `dist/server.js`. |
| `npm run lint` | Run ESLint. |
| `npm run lint:fix` | Run ESLint with automatic fixes. |
| `npm run format` | Format files with Prettier. |
| `npm run format:check` | Check formatting. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run typecheck:app` | Type-check the application source build target. |
| `npm test` | Run Vitest. |
| `npm run test:unit` | Run unit tests. |
| `npm run test:integration` | Run integration tests. |
| `npm run test:smoke` | Run smoke tests. |
| `npm run test:coverage` | Run coverage config. |
| `npm run test:api` | Run Newman API test script. |
| `npm run test:api:html` | Run Newman API tests with HTML reporting. |
| `npm run test:performance` | Run k6 performance scripts. |
| `npm run prisma:generate` | Generate Prisma Client. |
| `npm run prisma:migrate` | Run Prisma migrate dev. |
| `npm run prisma:deploy` | Apply migrations in deploy mode. |
| `npm run prisma:reset` | Reset database with Prisma. |
| `npm run prisma:studio` | Open Prisma Studio. |

## Database & Prisma

The database layer uses Prisma with PostgreSQL. The schema defines tenant-aware models, audit fields, soft delete fields, indexes, unique constraints, and relationships across core, authentication, education, assessment, learning, and commerce domains.

Prisma Client is imported from `src/database/prisma.ts` and reused through a singleton-style global in non-production environments.

See [Database](docs/DATABASE.md).

## Documentation Index

- [Architecture](docs/ARCHITECTURE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Database](docs/DATABASE.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Installation](docs/INSTALLATION.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [RBAC](docs/RBAC.md)
- [Multi-Tenancy](docs/MULTI_TENANCY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Production Setup](docs/PRODUCTION.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)
- [CI/CD](docs/CI_CD.md)
- [Docker](docs/DOCKER.md)
- [Operations](docs/OPERATIONS.md)
- [Kubernetes](docs/KUBERNETES.md)

## Security Overview

- Passwords are hashed with bcrypt before storage.
- Access tokens contain `sub`, `email`, `tenantId`, `iat`, and `exp`.
- Refresh tokens are generated, hashed before storage, and rotated.
- Authorization middleware resolves roles and permissions from the database.
- Helmet is enabled for security headers.
- CORS is configured through validated environment values.
- Rate limiting is enabled outside the test environment.
- Central error handling prevents raw unhandled errors from leaking in responses.

## Project Status

Implementation and Stage 8 testing are complete. Stage 9 documentation is complete. The repository now includes local production-readiness assets for CI, application container builds, production-oriented Compose simulation, liveness/readiness endpoints, and graceful shutdown. Real cloud deployment, Kubernetes, external monitoring, backup automation, and production secrets management remain infrastructure-dependent.
