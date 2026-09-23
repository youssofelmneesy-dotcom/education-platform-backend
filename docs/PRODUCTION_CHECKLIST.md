# Production Checklist

Use this checklist before promoting the backend to a production environment. Checked items reflect capabilities present in the repository. Unchecked items require environment setup, operational work, or later-stage implementation.

## Code Quality

- [x] TypeScript project configured.
- [x] ESLint configured.
- [x] Prettier configured.
- [x] Build script exists: `npm run build`.
- [x] Application source typecheck exists: `npm run typecheck:app`.
- [ ] `npm run typecheck` is clean in the current repository state.
- [ ] `npm run lint` is clean in the current repository state.

## Testing

- [x] Unit test suite exists.
- [x] Validator test suite exists.
- [x] Integration test suite exists.
- [x] Smoke test suite exists.
- [x] Performance test scripts exist for Auth.
- [x] API test runner exists.
- [x] Postman collection and local environment files exist.
- [ ] API test runner has been executed successfully in this final documentation pass.
- [ ] Performance test runner has been executed successfully in this final documentation pass.

## Security

- [x] `JWT_SECRET` is validated with a minimum length.
- [x] Passwords are hashed with bcrypt.
- [x] Refresh token secrets are stored as hashes.
- [x] Helmet middleware is enabled.
- [x] CORS is configurable.
- [x] Rate limiting is enabled outside tests.
- [x] Request body limits are configurable.
- [x] Zod validation is used.
- [x] Centralized error handling exists.
- [ ] Production secrets are managed by a secret manager.
- [ ] HTTPS is configured in production infrastructure.
- [ ] Dependency audit process is documented and automated.

## Database

- [x] PostgreSQL is configured through Prisma.
- [x] Prisma migrations exist.
- [x] Prisma deploy script exists: `npm run prisma:deploy`.
- [x] Tenant-aware schema constraints exist.
- [x] Soft-delete fields exist on tenant-owned business models.
- [ ] Production `DATABASE_URL` is configured.
- [ ] Backup automation is configured.
- [ ] Restore strategy is documented and tested.
- [ ] Migration deployment has been run against production.

## Deployment

- [x] Application start script exists: `npm run start`.
- [x] Application build script exists: `npm run build`.
- [x] `NODE_ENV=production` is supported by validation.
- [x] `PORT` is configurable.
- [x] `TRUST_PROXY` is configurable.
- [x] Application Dockerfile exists.
- [x] API service is defined in production-oriented Docker Compose.
- [ ] Reverse proxy is configured.
- [ ] HTTPS is configured.
- [ ] Production domain is configured.
- [x] Rollback strategy is documented.

## Observability

- [x] Request IDs are implemented.
- [x] Request logging exists outside tests.
- [x] Central error handling exists.
- [x] Basic root health response exists.
- [x] Dedicated readiness endpoint exists.
- [x] Dedicated liveness endpoint exists.
- [ ] External log aggregation is configured.
- [ ] Error monitoring is configured.
- [ ] Metrics are configured.
- [ ] Alerts are configured.

## Release

- [x] Core documentation exists.
- [x] OpenAPI documentation exists.
- [x] Postman/Newman files exist.
- [x] Deployment documentation exists.
- [x] Production setup documentation exists.
- [x] Production checklist exists.
- [x] Changelog exists.
- [x] License file exists.
- [ ] Git status is clean.
- [ ] Release version has been reviewed.
- [ ] Rollback plan has been approved.
