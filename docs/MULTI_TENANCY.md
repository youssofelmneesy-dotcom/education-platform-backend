# Multi-Tenancy

## Tenant Model

`Tenant` is the root model for tenant-owned data. It contains:

- `id`
- `name`
- `slug`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

The tenant model relates to users, profiles, roles, permissions, authentication records, course content, learning records, assessment records, certificates, and commerce records.

## Data Isolation

Business models include `tenantId` and define relationships back to `Tenant`. Many models also define composite unique constraints and composite relation references using `tenantId`.

This creates tenant-aware database constraints and prevents cross-tenant relationships for models that reference `[tenantId, id]`.

## Tenant-Aware Entities

Tenant-aware entities include identity, education, assessment, learning operation, authentication, and commerce models.

Examples:

- Users are unique by `[tenantId, email]`.
- Roles are unique by `[tenantId, name]`.
- Permissions are unique by `[tenantId, resource, action]`.
- Categories and tags are unique by `[tenantId, slug]`.
- Courses are unique by `[tenantId, slug]`.
- Lessons are unique by `[tenantId, courseId, slug]`.
- Orders are unique by `[tenantId, orderNumber]`.
- Invoices are unique by `[tenantId, invoiceNumber]`.

## Constraints

The schema uses tenant-scoped uniqueness for business identifiers and join-table uniqueness for relationships.

Join tables such as `UserRole`, `RolePermission`, `CourseCategory`, `CourseTag`, `BundleCourse`, and `QuestionPool` prevent duplicate associations within a tenant.

## Query Practices

Repositories include tenant filters for tenant-owned operations. Authentication and authorization derive tenant context from the token payload and then load user roles and permissions within that tenant.

## Soft Delete

Tenant-aware business records commonly include `deletedAt`. Active-record queries filter for `deletedAt: null` where required.

Indexes such as `[tenantId, deletedAt]` support tenant-scoped active record access.

## Implementation Notes

The current Auth repository uses a default tenant id fallback for registration and credential lookup when a tenant id is not supplied by the route flow. Authenticated requests carry `tenantId` in the token payload for downstream authorization and tenant-aware data access.
