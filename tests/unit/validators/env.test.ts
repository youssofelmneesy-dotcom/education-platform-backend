import { afterEach, describe, expect, it, vi } from "vitest";

function setBaseEnv(overrides: Record<string, string> = {}) {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4000";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/test_db?schema=public";
  process.env.JWT_SECRET = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.CORS_ORIGINS = "http://localhost:3000";
  process.env.REQUEST_BODY_LIMIT = "1mb";
  process.env.URLENCODED_BODY_LIMIT = "1mb";
  process.env.RATE_LIMIT_WINDOW_MS = "900000";
  process.env.RATE_LIMIT_MAX = "100";
  process.env.TRUST_PROXY = "false";

  for (const [key, value] of Object.entries(overrides)) {
    process.env[key] = value;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("environment validator", () => {
  it("should parse valid environment values", async () => {
    setBaseEnv();

    const { env } = await import("../../../src/config/env.js");

    expect(env.NODE_ENV).toBe("test");
    expect(env.PORT).toBe(4000);
    expect(env.JWT_SECRET).toHaveLength(32);
    expect(env.REQUEST_BODY_LIMIT).toBe("1mb");
  });

  it("should exit when required environment values are missing", async () => {
    setBaseEnv();
    delete process.env.DATABASE_URL;

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
      throw new Error(`exit:${code ?? 0}`);
    }) as never);

    await expect(import("../../../src/config/env.js")).rejects.toThrow("exit:1");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
