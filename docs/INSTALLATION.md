# Installation Guide

## Requirements

- Node.js and npm.
- PostgreSQL.
- Docker and Docker Compose if using the provided local database containers.
- k6 only if running performance tests.

## Clone Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

## Install Dependencies

```bash
npm install
```

The `prepare` script runs Prisma Client generation after install.

## Configure Environment

Create `.env`:

```bash
cp .env.example .env
```

Update the values to match the validated variables in [Environment Variables](ENVIRONMENT.md). Ensure `JWT_SECRET` is at least 32 characters.

## Start Local Database

The repository includes Docker Compose services for PostgreSQL and Redis:

```bash
docker compose up -d
```

The application currently uses PostgreSQL. Redis is defined in Compose but is not read by application code.

## Generate Prisma Client

```bash
npm run prisma:generate
```

## Run Migrations

For local development:

```bash
npm run prisma:migrate
```

For applying existing migrations without creating a new migration:

```bash
npm run prisma:deploy
```

## Seed Data

No seed script or seed file currently exists.

## Start Development Server

```bash
npm run dev
```

The API starts using the configured `PORT`.

## Build

```bash
npm run build
```

## Run Production Build Locally

```bash
npm run start
```

This runs `node dist/server.js`, so `npm run build` must run first.

## Verify

The root route returns a simple success response:

```text
GET /
```

Swagger UI infrastructure is mounted at:

```text
GET /api/docs
```

Endpoint-level OpenAPI documentation is intentionally outside this guide.
