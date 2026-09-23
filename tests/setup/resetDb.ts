import { beforeAll } from "vitest";
import { clearDatabase } from "./prismaTestUtils.js";

// Only clear DB once at the start of all tests, before each suite
// Integration tests manage their own cleanup via afterEach in test files
beforeAll(async () => {
  await clearDatabase();
});

// Note: Individual test files should use afterEach to clean up their test data
// This ensures database state is available throughout each test execution
