# Architecture Notes for AI-Assisted Work

Use the implementation as the source of truth. The canonical architecture document is:

- [Architecture](../ARCHITECTURE.md)

## Rules for Future Changes

- Keep modules isolated under `src/modules/<module-name>`.
- Route files should wire middleware, validation, and controller methods.
- Controllers should remain HTTP-focused.
- Services should contain business and application rules.
- Repositories should be the only layer that talks to Prisma.
- Shared behavior belongs in `src/shared` only when it is reusable across modules.
- Do not add Swagger endpoint paths, Postman collections, deployment guides, changelogs, or license text unless the task explicitly asks for that stage.
