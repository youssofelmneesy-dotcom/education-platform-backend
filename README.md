# Professional Multi-Tenant E-Learning Platform Backend

A production-oriented backend for a multi-tenant e-learning platform, built with Express, TypeScript, Prisma, and PostgreSQL.

The system is designed around modular domain architecture, tenant-aware data access, authentication, authorization, validation, testing, and operational backend concerns.

## Project Overview

This backend provides the core API infrastructure for a multi-tenant e-learning platform.

The platform is organized around domains including:

* Authentication
* Users
* Profiles
* Roles
* Permissions
* Categories
* Tags
* Courses
* Lessons
* Videos
* Student Learning
* Question Bank
* Assessments
* Learning Operations
* Lesson Attachments
* Commerce

The API is exposed under `/api` and uses Prisma with PostgreSQL for persistence.

Shared backend concerns such as validation, authentication, authorization, error handling, request IDs, logging, CORS, security headers, rate limiting, and standardized responses are handled through reusable infrastructure.

---

## Key Features

* Modular domain-based backend architecture
* Multi-tenant data model and tenant-aware repository access
* Access-token and refresh-token authentication
* Role-based and permission-based authorization
* Zod validation for request body, params, and query data
* Prisma repository layer for database access
* Centralized operational error handling
* Standardized API response handling
* Request ID and request logging infrastructure
* Security middleware with Helmet, CORS, compression, and rate limiting
* Swagger UI infrastructure at `/api/docs`
* Unit, validator, integration, smoke, API, and performance testing infrastructure
* Docker-based local and production-oriented environment support
* CI workflow infrastructure

---

## Tech Stack

| Category         | Technology                                |
| ---------------- | ----------------------------------------- |
| Runtime          | Node.js                                   |
| Framework        | Express 5                                 |
| Language         | TypeScript                                |
| Database         | PostgreSQL                                |
| ORM              | Prisma                                    |
| Validation       | Zod                                       |
| Authentication   | HMAC-signed tokens using Node.js `crypto` |
| Password Hashing | bcrypt                                    |
| Testing          | Vitest, Supertest, k6, Newman             |
| Tooling          | ESLint, Prettier, tsx                     |
| Containers       | Docker / Docker Compose                   |

---

## Architecture

The application follows a layered, domain-oriented architecture:

```text
Client
  ↓
Express App
  ↓
Global Middleware
  ↓
Module Router
  ↓
Route Middleware
  ↓
Validator
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma Client
  ↓
PostgreSQL
```

The main application entrypoints are:

```text
src/server.ts
src/app.ts
```

`src/server.ts` starts the HTTP server.

`src/app.ts` configures the Express application, global middleware, API routes, Swagger UI infrastructure, health endpoints, and centralized error handling.

### Architecture Diagram

![Architecture Diagram](docs/diagrams/architecture.png)

For the detailed implementation architecture, see:

[Architecture Documentation](docs/ARCHITECTURE.md)

---

## Multi-Tenancy

The backend is designed to support multiple organizations within the same application.

Tenant context is carried through the authenticated request and used throughout the authorization and data-access flow.

At the data-access layer, repositories apply tenant-aware queries where tenant isolation is required.

Conceptually:

```text
                ONE BACKEND
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Tenant A   Tenant B   Tenant C
          │          │          │
        Data       Data       Data
```

### Multi-Tenancy Diagram

![Multi-Tenancy Diagram](docs/diagrams/multi-tenancy.png)

For the implementation details, see:

[Multi-Tenancy Documentation](docs/MULTI_TENANCY.md)

---

## Folder Structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── database/
├── docs/
├── modules/
└── shared/

prisma/

tests/

docs/

scripts/
```

The main application implementation lives under `src/modules`.

Each domain module may contain its own:

* Routes
* Controllers
* Services
* Repositories
* DTOs
* Validators
* Interfaces
* Types
* Utilities

For more details:

[Folder Structure](docs/FOLDER_STRUCTURE.md)

---

## Security

The backend includes several security-oriented controls:

* Passwords are hashed with bcrypt before storage.
* Access tokens contain `sub`, `email`, `tenantId`, `iat`, and `exp`.
* Refresh tokens are generated and hashed before storage.
* Refresh tokens are rotated during refresh operations.
* Authorization middleware resolves roles and permissions from the database.
* Helmet is enabled for security headers.
* CORS is configured through validated environment values.
* Rate limiting is enabled outside the test environment.
* Centralized error handling prevents raw unhandled errors from being returned to clients.

For authentication and authorization architecture, see:

[Architecture](docs/ARCHITECTURE.md)

[RBAC](docs/RBAC.md)

---

## Database

The database layer uses Prisma with PostgreSQL.

The Prisma schema includes:

* Tenant-aware models
* Audit fields
* Soft-delete fields
* Indexes
* Unique constraints
* Relationships across core platform domains

Prisma Client is accessed through:

```text
src/database/prisma.ts
```

For more details:

[Database Documentation](docs/DATABASE.md)

---

## Prerequisites

Before running the project locally, make sure the following are available:

* Node.js compatible with the project's dependencies
* npm
* PostgreSQL

Optional tooling:

* Docker and Docker Compose for local PostgreSQL and test database environments
* k6 for performance testing
* Newman for API test execution

---

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

The `prepare` script generates the Prisma Client after installation.

---

## Environment Setup

Create a local `.env` file based on `.env.example`.

Validated environment variables include:

### Required

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
```

### Optional

```text
CORS_ORIGINS
REQUEST_BODY_LIMIT
URLENCODED_BODY_LIMIT
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX
TRUST_PROXY
```

For the complete environment configuration:

[Environment Variables](docs/ENVIRONMENT.md)

---

## Running the Project

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production Start

```bash
npm run start
```

---

## Testing

The project includes multiple testing layers covering application logic, database integration, HTTP workflows, and performance infrastructure.

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### Smoke Tests

```bash
npm run test:smoke
```

### Coverage

```bash
npm run test:coverage
```

### API Tests

```bash
npm run test:api
```

### Performance Tests

```bash
npm run test:performance
```

Run the complete configured Vitest test suite with:

```bash
npm test
```

For the testing strategy and test organization:

[Testing Strategy](docs/TESTING_STRATEGY.md)

---

## Available Scripts

| Script                     | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Start the API with `tsx watch`.                 |
| `npm run build`            | Compile TypeScript with `tsc`.                  |
| `npm run start`            | Run the built server.                           |
| `npm run lint`             | Run ESLint.                                     |
| `npm run lint:fix`         | Run ESLint with automatic fixes.                |
| `npm run format`           | Format files with Prettier.                     |
| `npm run format:check`     | Check formatting.                               |
| `npm run typecheck`        | Run TypeScript without emitting files.          |
| `npm run typecheck:app`    | Type-check the application source build target. |
| `npm test`                 | Run the configured Vitest tests.                |
| `npm run test:unit`        | Run unit tests.                                 |
| `npm run test:integration` | Run integration tests.                          |
| `npm run test:smoke`       | Run smoke tests.                                |
| `npm run test:coverage`    | Run coverage configuration.                     |
| `npm run test:api`         | Run Newman API tests.                           |
| `npm run test:api:html`    | Run Newman API tests with HTML reporting.       |
| `npm run test:performance` | Run k6 performance tests.                       |
| `npm run prisma:generate`  | Generate Prisma Client.                         |
| `npm run prisma:migrate`   | Run Prisma migrations in development.           |
| `npm run prisma:deploy`    | Apply Prisma migrations in deployment mode.     |
| `npm run prisma:reset`     | Reset the development database with Prisma.     |
| `npm run prisma:studio`    | Open Prisma Studio.                             |

---

## Documentation

| Document                                             | Description                                    |
| ---------------------------------------------------- | ---------------------------------------------- |
| [Architecture](docs/ARCHITECTURE.md)                 | Application architecture and request lifecycle |
| [Folder Structure](docs/FOLDER_STRUCTURE.md)         | Source-code organization and responsibilities  |
| [Database](docs/DATABASE.md)                         | Prisma and PostgreSQL architecture             |
| [Environment Variables](docs/ENVIRONMENT.md)         | Environment configuration                      |
| [Installation](docs/INSTALLATION.md)                 | Installation and setup details                 |
| [Development Guide](docs/DEVELOPMENT.md)             | Development workflow                           |
| [Testing Strategy](docs/TESTING_STRATEGY.md)         | Testing layers and strategy                    |
| [RBAC](docs/RBAC.md)                                 | Roles and permissions                          |
| [Multi-Tenancy](docs/MULTI_TENANCY.md)               | Tenant model and isolation approach            |
| [Deployment](docs/DEPLOYMENT.md)                     | Deployment documentation                       |
| [Production Setup](docs/PRODUCTION.md)               | Production-oriented setup                      |
| [Production Checklist](docs/PRODUCTION_CHECKLIST.md) | Production readiness checklist                 |
| [CI/CD](docs/CI_CD.md)                               | Continuous integration documentation           |
| [Docker](docs/DOCKER.md)                             | Docker configuration                           |
| [Operations](docs/OPERATIONS.md)                     | Operational considerations                     |
| [Kubernetes](docs/KUBERNETES.md)                     | Kubernetes-related documentation               |

---

## Project Status

The implementation and Stage 8 testing are complete.

The repository includes documentation and engineering assets covering:

* Modular backend architecture
* Multi-tenant data access
* Authentication and authorization
* Validation
* Testing infrastructure
* API testing
* Docker-based environments
* CI workflow infrastructure
* Application health endpoints
* Graceful shutdown
* Production-oriented local configuration

Actual cloud deployment, Kubernetes infrastructure, external monitoring, automated backups, and production secrets management remain environment- and infrastructure-dependent.

---

## License

This project is licensed under the terms described in the [LICENSE](LICENSE) file.

