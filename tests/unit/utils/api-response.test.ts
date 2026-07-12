import { describe, expect, it, vi } from "vitest";
import { sendError, sendSuccess } from "../../../src/shared/utils/api-response.js";

function createMockResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  return { status, json };
}

describe("sendSuccess", () => {
  it("should return a success payload with data", () => {
    const response = createMockResponse();

    sendSuccess(response as never, 200, "ok", { id: 1 });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ success: true, message: "ok", data: { id: 1 } });
  });

  it("should return a success payload without data", () => {
    const response = createMockResponse();

    sendSuccess(response as never, 204, "done");

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.json).toHaveBeenCalledWith({ success: true, message: "done" });
  });
});

describe("sendError", () => {
  it("should return an error payload with errors", () => {
    const response = createMockResponse();

    sendError(response as never, 400, "bad request", [{ field: "email" }]);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ success: false, message: "bad request", errors: [{ field: "email" }] });
  });

  it("should return an error payload without errors", () => {
    const response = createMockResponse();

    sendError(response as never, 500, "server error");

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ success: false, message: "server error" });
  });
});
