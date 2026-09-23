# Architecture

## Overview

The backend is an Express application written in TypeScript and organized around domain modules under `src/modules`, with shared infrastructure under `src/shared`.

The architecture separates HTTP handling, application logic, data access, and database infrastructure.

The main request flow is:

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

![Architecture Diagram](diagrams/architecture.png)

---

## Application Entry Points

### `src/server.ts`

The server entrypoint:

* Imports the configured Express application.
* Reads the validated port configuration.
* Starts the HTTP server.
* Handles the server lifecycle and graceful shutdown behavior.

### `src/app.ts`

The Express application configuration:

* Registers global middleware.
* Configures security-related middleware.
* Mounts module routers under `/api`.
* Exposes Swagger UI infrastructure.
* Defines health endpoints.
* Registers not-found handling.
* Registers the centralized error handler.

---

## Request Lifecycle

A typical request moves through the following stages:

### 1. Express Application

The request enters the Express application.

### 2. Global Middleware

Shared middleware handles cross-cutting concerns such as:

* Request IDs
* Request logging
* Security headers
* CORS
* Compression
* Rate limiting
* Request body parsing

### 3. Module Router

The request is routed to the module responsible for the requested domain.

Examples include:

```text
Auth
Users
Courses
Learning
Assessments
Commerce
```

### 4. Route Middleware

Protected routes may apply:

* Authentication
* Role checks
* Permission checks

### 5. Validation

Zod validators validate and normalize:

* Request body
* Route parameters
* Query parameters

Validated values replace the corresponding request data before controller logic runs.

### 6. Controller

Controllers handle HTTP-specific concerns.

They:

* Read validated request data.
* Call the appropriate service.
* Select the HTTP response status.
* Return the standardized response shape.

Controllers do not own database queries or business rules.

### 7. Service

Services contain application and business behavior.

Depending on the module, services handle responsibilities such as:

* Duplicate checks
* Password hashing
* Token generation
* Token rotation
* Ownership checks
* Status transitions
* Soft deletes
* Domain-specific business rules

Where repository interfaces are defined, services depend on those interfaces instead of directly depending on Prisma query syntax.

### 8. Repository

Repositories form the database-access boundary.

They:

* Receive data-access requests from services.
* Execute Prisma operations.
* Apply tenant-aware data access where required.
* Return selected records to the service layer.

This keeps Prisma-specific query logic centralized within the repository layer.

### 9. Prisma and PostgreSQL

Repositories use Prisma Client to communicate with PostgreSQL.

The Prisma schema defines the application's models, relationships, constraints, indexes, tenant relationships, audit fields, and soft-delete fields.

---

## Layer Responsibilities

### Routes

Routes define:

* HTTP method
* Endpoint path
* Middleware composition
* Authentication requirements
* Permission requirements
* Validation schemas
* Controller mapping

Routes should remain focused on composing the request pipeline.

---

### Controllers

Controllers are responsible for HTTP behavior.

They should:

* Read validated input.
* Call services.
* Select appropriate response status codes.
* Return standardized responses.

Controllers should not contain:

* Direct Prisma queries
* Database access logic
* Large business rules

---

### Services

Services contain application and domain behavior.

They coordinate business operations and use repositories for persistence.

Examples include:

* Authentication flows
* User operations
* Ownership validation
* Token rotation
* Status changes
* Soft deletion
* Domain-specific validation

---

### Repositories

Repositories isolate database access.

They are responsible for translating application-level data requests into Prisma operations.

Repositories also provide the main boundary for tenant-aware database queries.

---

### DTOs

DTOs describe request and response data shapes used by modules.

Depending on the module, DTOs are represented as TypeScript interfaces or types.

---

### Validators

Validators use Zod schemas.

The shared validation middleware parses and replaces:

```text
req.body
req.params
req.query
```

with validated values before the request reaches controller logic.

Validation failures are converted into standardized `400` responses by the centralized error handler.

---

## Multi-Tenancy

The platform is designed to support multiple tenants within the same backend application.

The authenticated request carries tenant context through the access token:

```text
Access Token
     │
     └── tenantId
```

The authorization layer resolves the authenticated user's context, while repositories apply tenant-aware queries where tenant isolation is required.

Conceptually:

```text
                    ONE BACKEND
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
          Tenant A    Tenant B    Tenant C
             │           │           │
           Data        Data        Data
```

The important boundary is the data-access layer:

```text
Request
   ↓
Authentication
   ↓
Tenant Context
   ↓
Authorization
   ↓
Service
   ↓
Repository
   ↓
Tenant-aware Query
   ↓
PostgreSQL
```

For the dedicated tenant model and isolation approach:

[Multi-Tenancy Documentation](MULTI_TENANCY.md)

![Multi-Tenancy Diagram](diagrams/multi-tenancy.png)

---

## Authentication Flow

Authentication is implemented in the Auth module.

### Registration

```text
Register Request
      ↓
Validation
      ↓
Email Uniqueness Check
      ↓
Password Hashing
      ↓
User Creation
```

### Login

```text
Login Request
      ↓
Validation
      ↓
Credential Verification
      ↓
Access Token
      +
Refresh Token
      ↓
Persist Hashed Refresh Token
```

### Refresh

```text
Refresh Token
      ↓
Validation
      ↓
Token Verification
      ↓
Stored Hash Comparison
      ↓
Rotate Refresh Token
      ↓
Issue New Tokens
```

### Logout

```text
Refresh Token
      ↓
Validation
      ↓
Token Verification
      ↓
Revoke Stored Refresh Token
```

Access tokens are HMAC-signed using Node.js `crypto`.

The token payload contains:

```text
sub
email
tenantId
iat
exp
```

---

## Authorization Flow

Protected routes use `authMiddleware`.

The middleware:

1. Reads the `Authorization: Bearer <token>` header.
2. Verifies the token signature.
3. Verifies token expiry.
4. Validates the token payload shape.
5. Loads the user's authorization context from the database.
6. Attaches the authentication and authorization context to the request.

The request may receive:

```text
req.auth
req.user
req.userRoles
req.userPermissions
```

Authorization middleware then applies the required access rules.

Available authorization helpers include:

```text
requireRoles
requirePermissions
requireAnyPermission
requireAllPermissions
```

Permissions are represented as lower-case resource/action keys, for example:

```text
resource:action
```

---

## Error Handling

Expected application errors use `AppError` or its subclasses.

Examples include:

```text
UnauthorizedError
ForbiddenAppError
```

Module-specific errors can extend the same operational error model.

The centralized error handler processes:

* Zod validation errors
* Application errors
* Known Prisma errors
* Unknown errors

Validation errors return `400`.

Application errors use their configured status codes.

Known Prisma conflicts and missing-record conditions are mapped into appropriate application responses.

Unknown errors are returned as:

```text
500 Internal Server Error
```

A standardized error response follows this general shape:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

Validation errors may additionally include an `errors` object.

---

## Shared Infrastructure

Shared infrastructure lives under:

```text
src/shared/
```

### `config`

HTTP and application configuration derived from validated environment variables.

### `errors`

Operational error classes used throughout the application.

### `middlewares`

Cross-cutting middleware including:

* Error handler
* Not-found handler
* Request ID
* Request logger
* Rate limiter
* Validation middleware

### `utils`

Reusable application utilities including:

* Response helpers
* Async handler
* Logger
* Shared utility functions

---

## Design Principles

The architecture is built around several separation-of-concern principles:

### Domain Separation

Business domains are organized into independent modules under:

```text
src/modules/
```

### HTTP Separation

Controllers and routes handle HTTP concerns without owning database logic.

### Business Logic Separation

Services contain application behavior independently from Prisma query syntax.

### Data Access Separation

Repositories provide a boundary around Prisma operations.

### Cross-Cutting Infrastructure

Shared middleware and utilities live under:

```text
src/shared/
```

### Tenant-Aware Data Access

Tenant-specific data access is enforced through the application and repository layers where required.

---

## Related Documentation

* [Folder Structure](FOLDER_STRUCTURE.md)
* [Database](DATABASE.md)
* [RBAC](RBAC.md)
* [Multi-Tenancy](MULTI_TENANCY.md)
* [Testing Strategy](TESTING_STRATEGY.md)
* [Deployment](DEPLOYMENT.md)
* [Production Setup](PRODUCTION.md)
* [CI/CD](CI_CD.md)
* [Docker](DOCKER.md)
