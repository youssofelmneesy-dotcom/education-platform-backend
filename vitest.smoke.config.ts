import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/smoke/**/*.test.ts"],
    setupFiles: ["./tests/setup/setupEnv.ts", "./tests/setup/resetDb.ts"],
    globalSetup: "./tests/setup/global-setup.ts",
    globalTeardown: "./tests/setup/global-teardown.ts",
    // Smoke tests should run sequentially with DB cleanup
    threads: false,
    singleThread: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: false,
    },
  },
});
