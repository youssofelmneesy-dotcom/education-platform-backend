import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/setup/setupEnv.ts", "./tests/setup/resetDb.ts"],
    globalSetup: "./tests/setup/global-setup.ts",
    globalTeardown: "./tests/setup/global-teardown.ts",
    // Run integration tests sequentially to avoid database deadlocks
    // Disable threading to run all tests in a single process
    threads: false,
    singleThread: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: false,
    },
  },
});
