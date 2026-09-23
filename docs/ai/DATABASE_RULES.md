# Database Rules for AI-Assisted Work

The canonical database documentation is:

- [Database](../DATABASE.md)
- [Multi-Tenancy](../MULTI_TENANCY.md)

## Schema Conventions

- Preserve the PostgreSQL datasource and Prisma Client generator.
- Use UUID ids for persisted models.
- Use tenant-aware relationships and constraints for business data.
- Keep audit fields consistent: `createdAt`, `updatedAt`, and `deletedAt` where the model follows the soft-delete strategy.
- Prefer repository-level Prisma access over direct Prisma calls from controllers or services.
- Do not generate migrations unless the task explicitly asks for migration work.
