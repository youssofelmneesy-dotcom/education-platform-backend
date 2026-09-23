# Architecture

## High-Level Architecture

The backend is an Express application written in TypeScript. It is organized by domain modules under `src/modules`, with shared infrastructure under `src/shared`.

The implemented request path is:

```text
Client
  -> Express app
  -> Global middleware
  -> Module router
  -> Route middleware
  -> Validator
  -> Controller
  -> Service
  -> Repository
  -> Prisma Client
  -> PostgreSQL
```

The application entrypoint is `src/server.ts`. It imports `src/app.ts`, reads the validated port configuration, and starts the Express server.

`src/app.ts` configures global middleware, mounts module routers under `/api`, exposes the Swagger UI infrastructure, defines the root health response, and registers not-found and error handlers.

## Request Lifecycle

1. A request enters the Express app.
2. Global middleware assigns a request id, optionally logs the request, applies security headers, CORS, compression, rate limiting, and body parsers.
3. The request reaches a mounted module router.
4. Protected routes run authentication middleware and permission checks.
5. Route validators parse `body`, `params`, and `query` with Zod.
6. Controllers receive validated input and call services.
7. Services apply application rules and call repositories.
8. Repositories execute Prisma queries.
9. Controllers send standardized success responses.
10. Errors flow into the centralized error handler.

## Layer Responsibilities

### Routes

Routes compose middleware and controller methods. They define the HTTP method, path, authentication requirement, permission requirement, and validation schemas for each endpoint.

### Controllers

Controllers handle HTTP-specific behavior:

- Read request data.
- Call the correct service method.
- Choose the response status code.
- Return a standardized response shape.

Controllers should not own database queries or business rules.

### Services

Services contain application behavior. Existing services handle responsibilities such as duplicate checks, password hashing, token generation, token rotation, ownership checks, status transitions, soft deletes, and domain-specific validation beyond Zod shape validation.

Services depend on repository interfaces where the module defines them, which keeps business behavior separate from Prisma details.

### Repositories

Repositories are the Prisma boundary. They translate service requests into Prisma operations and return selected records to services.

The pattern keeps controllers and services independent from Prisma query syntax and centralizes tenant-aware database access.

### DTOs

DTO files describe request and response data shapes used by controllers and services. They are TypeScript interfaces or types according to the style of the module.

### Validators

Validators use Zod schemas. The shared `validate` middleware parses and replaces request `body`, `params`, and `query` with validated values before controller logic runs.

Validation failures are handled by the global error handler as `400` responses.

### Shared Components

Shared infrastructure lives under `src/shared`:

- `config`: HTTP configuration derived from validated environment values.
- `errors`: base operational error classes.
- `middlewares`: error handler, not-found handler, request id, request logger, rate limiter, and validation middleware.
- `utils`: response helpers, async handler, logger, and shared utilities.

## Error Handling Flow

Expected application errors use `AppError` or subclasses such as `UnauthorizedError` and `ForbiddenAppError`. Module-specific errors extend the same operational error model.

The global error handler handles:

- Zod validation errors as `400`.
- `AppError` instances using their configured status code.
- Prisma known errors such as unique conflicts and missing records.
- Unknown errors as `500 Internal server error`.

Responses use the shared error shape:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

Validation errors may include an `errors` object.

## Authentication Flow

Authentication is implemented in the Auth module.

- Register validates input, checks email uniqueness, hashes the password with bcrypt, and creates a user.
- Login validates credentials, compares the password hash, creates an access token, creates a refresh token, hashes the refresh token secret, and stores it.
- Refresh validates the refresh token, compares it with the stored hash, rotates the stored token hash, and returns new tokens.
- Logout validates the refresh token and revokes the stored refresh token.

Access tokens are HMAC-signed tokens implemented with Node `crypto`. The payload contains `sub`, `email`, `tenantId`, `iat`, and `exp`.

## Authorization Flow

Protected routes use `authMiddleware` to:

1. Read the `Authorization: Bearer <token>` header.
2. Verify the token signature and expiry.
3. Validate the token payload shape.
4. Load the user's authorization context from the database.
5. Attach `req.auth`, `req.user`, `req.userRoles`, and `req.userPermissions`.

Authorization middleware then enforces roles or permissions:

- `requireRoles`
- `requirePermissions`
- `requireAnyPermission`
- `requireAllPermissions`

Permissions are represented as lower-case `resource:action` keys, built from role-permission records.
