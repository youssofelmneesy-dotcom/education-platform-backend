# Testing Strategy

The repository contains a completed Stage 8 test implementation across unit, validator, integration, smoke, API runner, and performance test areas.

No coverage percentage is documented here because coverage output was not audited as a release metric.

## Unit Tests

Unit tests live under:

```text
tests/unit/services
tests/unit/utils
```

Service unit tests use mocks to verify service behavior without a database. They cover success paths, expected failures, authorization or ownership checks where implemented in services, and edge cases.

Utility tests verify shared helper behavior such as response helpers, async handling, authorization helpers, logger behavior, and environment validation.

Run unit tests:

```bash
npm run test:unit
```

## Validator Tests

Validator tests live under:

```text
tests/unit/validators
```

They verify Zod schemas for valid input, invalid input, required fields, type coercion where implemented, enum-like values where represented as strings, and module-specific validation rules.

Run validator tests as part of unit tests:

```bash
npm run test:unit
```

## Integration Tests

Integration tests live under:

```text
tests/integration
```

They use Supertest against the Express app and a PostgreSQL test database. Test setup files configure the environment, reset database state, and provide helpers for authentication and fixtures.

Integration tests verify route behavior, validation failures, unauthorized requests, forbidden requests where RBAC applies, not-found behavior, duplicate handling, persistence, and response status codes.

Run integration tests:

```bash
npm run test:integration
```

## Smoke Tests

Smoke tests live under:

```text
tests/smoke
```

They provide basic confidence that the application can respond successfully at the highest level.

Run smoke tests:

```bash
npm run test:smoke
```

## Performance Tests

Performance scripts live under:

```text
tests/performance
```

The current k6 scripts cover authentication flows:

- Register
- Login
- Refresh
- Logout

The performance runner starts the local API using `env.test`, waits for it to become available, then runs the configured k6 scripts.

Run performance tests:

```bash
npm run test:performance
```

k6 must be installed and available on `PATH`.

## API Tests

API test documentation lives under:

```text
tests/api
newman
```

The API test runner exists at `scripts/run-api-tests.mjs` and starts the local API before invoking Newman.

The runner uses:

```text
postman/Education Platform API.postman_collection.json
postman/Education Platform Local.postman_environment.json
```

Those Postman files are present in the repository and mirror the verified OpenAPI route surface.

Run API tests when the collection exists:

```bash
npm run test:api
npm run test:api:html
```

## Test Configuration

Vitest configs:

- `vitest.config.ts`: default unit-test oriented config.
- `vitest.unit.config.ts`: unit test suite.
- `vitest.integration.config.ts`: integration suite with database setup and sequential execution.
- `vitest.smoke.config.ts`: smoke suite.
- `vitest.coverage.config.ts`: all-test coverage config.

Integration and coverage configs disable parallel threading to reduce database conflicts.
