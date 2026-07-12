import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../../src/shared/utils/logger.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("logger", () => {
  it("should log info messages with metadata", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logger.info("loaded", { count: 1 });

    expect(infoSpy).toHaveBeenCalledWith('[INFO] loaded {"count":1}');
  });

  it("should log warnings with metadata", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    logger.warn("careful", { path: "/tmp" });

    expect(warnSpy).toHaveBeenCalledWith('[WARN] careful {"path":"/tmp"}');
  });

  it("should log errors with metadata", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logger.error("failed", { code: 500 });

    expect(errorSpy).toHaveBeenCalledWith('[ERROR] failed {"code":500}');
  });

  it("should log debug messages outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    logger.debug("trace", { step: 1 });

    expect(debugSpy).toHaveBeenCalledWith('[DEBUG] trace {"step":1}');
  });

  it("should skip debug messages in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    logger.debug("trace", { step: 1 });

    expect(debugSpy).not.toHaveBeenCalled();
  });
});
