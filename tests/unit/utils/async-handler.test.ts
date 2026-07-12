import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../../../src/shared/utils/async-handler.js";

function createMockContext() {
  const req = {} as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
}

describe("asyncHandler", () => {
  it("should forward resolved handlers without calling next", async () => {
    const { req, res, next } = createMockContext();
    const handler = vi.fn().mockResolvedValue(undefined);

    const wrapped = asyncHandler(handler);
    wrapped(req, res, next);

    await Promise.resolve();

    expect(handler).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it("should forward rejected handlers to next", async () => {
    const { req, res, next } = createMockContext();
    const error = new Error("boom");
    const handler = vi.fn().mockRejectedValue(error);

    const wrapped = asyncHandler(handler);
    wrapped(req, res, next);

    await Promise.resolve();

    expect(handler).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(error);
  });
});
