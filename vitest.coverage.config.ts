import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup/setupEnv.ts", "./tests/setup/resetDb.ts"],
    globalSetup: "./tests/setup/global-setup.ts",
    fileParallelism: false,
    maxWorkers: 1,

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      include: ["src/**/*.{ts,js}"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "prisma/generated/**",
        "src/generated/**",
        "src/**/__generated__/**",
        "**/*.d.ts",
      ],
    },
  },
});
