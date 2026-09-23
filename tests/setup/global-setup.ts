import dotenv from "dotenv";
import { execSync } from "child_process";

// Ensure test env loaded for setup steps
dotenv.config({ path: "./env.test", override: process.env.CI !== "true" });
process.env.NODE_ENV = "test";

function assertSafeTestDatabase(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for integration tests");
  }

  const isLocalTestDatabase =
    (databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")) &&
    (databaseUrl.includes("test") || databaseUrl.includes("teching_test") || databaseUrl.includes("education_platform_test"));

  if (!isLocalTestDatabase) {
    throw new Error("Refusing to reset a non-local/non-test database during test setup");
  }
}

assertSafeTestDatabase();

// Generate prisma client and run migrations against the test database
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  execSync("npx prisma migrate reset --force --skip-generate", { stdio: "inherit" });
} catch (err) {
  // If migrations fail, show error and rethrow to fail the setup
  // eslint-disable-next-line no-console
  console.error("Prisma migration/generate failed:", err);
  throw err;
}

// Wait for DB to be ready by attempting simple connection using prisma client
import { prisma } from "../../src/database/index.js";

async function waitForDb(retries = 10, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
       
      await prisma.$queryRawUnsafe("SELECT 1");
      return;
    } catch (_e) {
      // eslint-disable-next-line no-console
      console.log(`DB not ready yet, retrying (${i + 1}/${retries})...`);
       
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unable to connect to test database");
}

async function ensureDefaultTenant() {
  const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
  
  try {
    // Check if default tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: DEFAULT_TENANT_ID },
    });

    if (!existingTenant) {
      // Create default tenant if it doesn't exist
      await prisma.tenant.create({
        data: {
          id: DEFAULT_TENANT_ID,
          name: "Default Tenant",
          slug: "default",
          isActive: true,
        },
      });
      // eslint-disable-next-line no-console
      console.log("✓ Default tenant created");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Could not ensure default tenant:", err);
  }
}

export default async function globalSetup() {
  await waitForDb();
  await ensureDefaultTenant();
}
