# Development Guide

## Project Structure

The backend is organized by module. Each module owns its HTTP routes, controller, service, repository, validators, DTOs, interfaces, types, and local utilities.

Shared infrastructure belongs in `src/shared`. Environment validation belongs in `src/config`. Prisma Client setup belongs in `src/database`.

## Coding Conventions

- Use TypeScript strict mode.
- Keep files focused on one layer responsibility.
- Export through `index.ts` files where the module already follows that pattern.
- Prefer existing module naming and folder conventions.
- Avoid direct Prisma access outside repositories.
- Avoid business logic in controllers.
- Avoid HTTP response handling in services.
- Avoid commented-out code and placeholder comments.

## Repository Pattern

Repositories communicate with Prisma and return selected records to services.

Repository responsibilities:

- Build Prisma queries.
- Apply tenant-aware filters where required.
- Select only the fields needed by the service.
- Persist domain changes.

Repositories should not own business decisions such as password hashing, permission checks, or status transition rules.

## Service Responsibilities

Services contain application behavior. Existing services perform checks such as:

- Duplicate record handling.
- Ownership and tenant-aware access checks.
- Password hashing.
- Token generation and rotation.
- Soft delete and restore behavior.
- Domain status transitions.
- Meaningful application errors.

Services should depend on repository interfaces when the module defines them.

## Controller Responsibilities

Controllers coordinate HTTP request and response handling.

Controller responsibilities:

- Read validated request data.
- Call service methods.
- Send success responses with the shared response helper.
- Let errors flow into the global error handler.

Controllers should not query Prisma directly.

## Validation Flow

Validators are Zod schemas stored in module `validators` folders.

Routes attach validators with:

```text
validate({ body, params, query })
```

The shared validation middleware parses matching request parts and replaces them with parsed values. If parsing fails, the global error handler returns a validation error response.

## Error Handling

Expected errors use `AppError` or module-specific subclasses. The global error handler maps:

- Zod errors to `400`.
- Unauthorized errors to `401`.
- forbidden errors to `403`.
- Prisma unique conflicts to `409`.
- Prisma missing records to `404`.
- Unknown errors to `500`.

Use meaningful module errors for predictable business failures.

## Authentication

Authentication is implemented in `src/modules/auth`.

The implementation supports register, login, refresh, and logout. Passwords are hashed with bcrypt. Access and refresh tokens are signed with Node `crypto`. Refresh token secrets are stored as bcrypt hashes.

Protected routes use `authMiddleware`.

## Authorization

Authorization uses roles and permissions from the database. `authMiddleware` loads the authorization context and attaches roles and permission keys to the request.

Routes enforce access with:

- `requireRoles`
- `requirePermissions`
- `requireAnyPermission`
- `requireAllPermissions`

## Adding a New Module

Follow the existing module structure:

```text
src/modules/<module>/
  controllers/
  dto/
  interfaces/
  repositories/
  routes/
  services/
  types/
  utils/
  validators/
  index.ts
```

Recommended workflow:

1. Define DTOs and interfaces.
2. Add validators for request data.
3. Implement repository methods for Prisma access.
4. Implement service behavior.
5. Implement controller methods.
6. Wire routes with validation, auth, and authorization middleware.
7. Mount the router in `src/app.ts`.
8. Add unit, validator, and integration tests.

Only add folders that the module actually needs.

## Testing Philosophy

The repository uses:

- Service unit tests with mocks.
- Validator tests for Zod schemas.
- Integration tests with Supertest and a test database.
- Smoke tests for basic application behavior.
- Performance scripts for auth flows.
- API test runner infrastructure for Newman/Postman.

Tests should verify behavior at the correct layer. Unit tests should not require the database. Integration tests should exercise real HTTP behavior and persistence.

## Development Workflow

Common local loop:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run build
```

Use focused test commands while working on a single module, then run broader checks before handoff.
