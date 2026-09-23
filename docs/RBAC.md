# RBAC

## Overview

Authorization is implemented with users, roles, permissions, and join tables in Prisma:

- `User`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

The Auth module loads the current user's authorization context after verifying the access token.

## Authentication

Protected routes use `authMiddleware`.

The middleware:

1. Reads the `Authorization` header.
2. Requires the `Bearer <token>` format.
3. Verifies the token using the configured JWT secret.
4. Requires token payload fields: `sub`, `email`, `tenantId`, `iat`, and `exp`.
5. Loads authorization context from the database.
6. Attaches the context to the Express request.

If authentication fails, the request receives an unauthorized error.

## Roles

Roles are tenant-aware records. A user can have many roles through `UserRole`.

During authorization context loading, role names are normalized to lower case before being attached to the request.

Role checks are available through:

```text
requireRoles(...roles)
```

## Permissions

Permissions are tenant-aware records with `resource` and `action` fields. A role can have many permissions through `RolePermission`.

At runtime, permissions are represented as lower-case keys:

```text
resource:action
```

Examples from route usage include:

- `courses:create`
- `courses:list`
- `lessons:read`
- `videos:update`
- `question-bank:delete`
- `assessments:grade`
- `orders:list`
- `certificates:create`

Permission checks are available through:

```text
requirePermissions(...permissions)
requireAnyPermission(...permissions)
requireAllPermissions(...permissions)
```

`requirePermissions` uses the all-permissions behavior.

## Access Control Flow

1. Route applies `authMiddleware`.
2. Middleware verifies the access token.
3. Middleware queries the user's active roles and active permissions for the token tenant.
4. Middleware attaches `req.auth`, `req.user`, `req.userRoles`, and `req.userPermissions`.
5. Route permission middleware checks required access.
6. Missing authentication returns `401`.
7. Missing authorization returns `403`.

## Tenant Awareness

RBAC records are scoped by `tenantId`. Role and permission lookups are performed within the authenticated tenant context.

Soft-deleted roles, role assignments, permissions, and role-permission records are excluded by the authorization context query.
