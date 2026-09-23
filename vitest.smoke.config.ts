import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/smoke/**/*.test.ts"],
    setupFiles: ["./tests/setup/setupEnv.ts", "./tests/setup/resetDb.ts"],
    globalSetup: "./tests/setup/global-setup.ts",
    fileParallelism: false,
    maxWorkers: 1,

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
