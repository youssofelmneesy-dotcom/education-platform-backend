# CI/CD

This repository includes a GitHub Actions CI workflow at `.github/workflows/ci.yml`.

## Current Implementation

The workflow is intentionally limited to checks that can run without production secrets or cloud credentials.

It runs on pull requests and pushes to `main` or `master`:

- `npm ci`
- `npm run prisma:generate`
- `npx prisma validate`
- `npm run prisma:deploy` against a GitHub Actions PostgreSQL service
- `npm run typecheck:app`
- `npm run lint`
- `npm run test:unit`
- `npm run test:integration`
- `npm run build`

The workflow provides a PostgreSQL 17 service container for integration tests. It does not deploy the application.

## Environment

CI uses non-production test values defined directly in the workflow. No production secrets are required.

The CI `JWT_SECRET` is a test-only value and must not be reused outside CI.

## Deployment

Deployment automation is intentionally not implemented.

Real deployment requires human decisions and infrastructure-specific configuration, including:

- Cloud provider or hosting platform.
- Production database.
- Secrets manager.
- Domain and DNS.
- TLS certificates or managed HTTPS.
- Rollback strategy.
- Environment-specific approval gates.

## Recommended Future Work

- Add a deployment workflow after the target platform is selected.
- Store production secrets in the platform or GitHub Actions secrets.
- Add manual approval gates for production releases.
- Publish Docker images to a registry only after registry ownership is confirmed.
