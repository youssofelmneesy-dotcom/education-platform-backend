import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Only include unit tests that don't require the database
    include: ["tests/unit/**/*.test.ts"],
    // Don't use setupFiles that clear database - unit tests don't need DB
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,js}"],
    },
  },
});
