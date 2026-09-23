# Coding Standards for AI-Assisted Work

The canonical development guide is:

- [Development Guide](../DEVELOPMENT.md)

## Implementation Conventions

- Use TypeScript strict-mode patterns already present in the repository.
- Prefer interfaces and DTO files that match the surrounding module style.
- Validate request input with Zod schemas and the shared `validate` middleware.
- Use `asyncHandler` for async route handlers.
- Throw typed `AppError` subclasses or module-specific errors for expected failures.
- Keep Prisma calls inside repositories.
- Do not return password hashes or token hashes from services or controllers.
- Update tests when changing behavior.
- Do not introduce unrelated refactors during feature work.
