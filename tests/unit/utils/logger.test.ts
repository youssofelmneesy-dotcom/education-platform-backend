import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../../src/shared/utils/logger.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("logger", () => {
  it("should log info messages with metadata", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.info("loaded", { count: 1 });

    expect(writeSpy).toHaveBeenCalledOnce();
    const entry = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({ level: "info", message: "loaded", meta: { count: 1 } });
    expect(entry.timestamp).toEqual(expect.any(String));
  });

  it("should log warnings with metadata", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.warn("careful", { path: "/tmp" });

    const entry = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({ level: "warn", message: "careful", meta: { path: "/tmp" } });
  });

  it("should log errors with metadata", () => {
    const writeSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    logger.error("failed", { code: 500 });

    const entry = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({ level: "error", message: "failed", meta: { code: 500 } });
  });

  it("should log debug messages outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.debug("trace", { step: 1 });

    const entry = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({ level: "debug", message: "trace", meta: { step: 1 } });
  });

  it("should skip debug messages in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.debug("trace", { step: 1 });

    expect(writeSpy).not.toHaveBeenCalled();
  });

  it("should redact sensitive metadata fields", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.info("auth event", {
      email: "user@example.com",
      password: "secret",
      nested: { refreshToken: "token-value" },
    });

    const entry = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));
    expect(entry.meta).toEqual({
      email: "user@example.com",
      password: "[REDACTED]",
      nested: { refreshToken: "[REDACTED]" },
    });
  });
});
