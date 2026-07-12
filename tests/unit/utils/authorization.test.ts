import { describe, expect, it } from "vitest";
import { hasAnyRole, hasPermissions, normalizeAuthorizationValue, normalizePermission } from "../../../src/modules/auth/utils/authorization.js";

describe("authorization helpers", () => {
  it("should normalize authorization values", () => {
    expect(normalizeAuthorizationValue("  Admin ")).toBe("admin");
  });

  it("should normalize permission keys", () => {
    expect(normalizePermission("  COURSES:READ  ")).toBe("courses:read");
  });

  it("should detect any matching role", () => {
    expect(hasAnyRole(["student", "teacher"], ["ADMIN", "teacher"])).toBe(true);
  });

  it("should reject when no required role is present", () => {
    expect(hasAnyRole(["student"], ["admin", "teacher"])).toBe(false);
  });

  it("should detect any matching permission", () => {
    expect(hasPermissions(["courses:read", "users:update"], ["USERS:UPDATE"], "any")).toBe(true);
  });

  it("should require all permissions in all mode", () => {
    expect(hasPermissions(["courses:read", "users:update"], ["courses:read", "users:update"], "all")).toBe(true);
  });

  it("should reject missing permission in all mode", () => {
    expect(hasPermissions(["courses:read"], ["courses:read", "users:update"], "all")).toBe(false);
  });
});
