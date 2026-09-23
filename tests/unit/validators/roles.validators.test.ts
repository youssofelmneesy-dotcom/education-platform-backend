import { describe, expect, it } from "vitest";

import { createRoleSchema, updateRoleSchema } from "../../../src/modules/roles/validators/index.js";

describe("roles validators", () => {
  it("validates create role payloads", () => {
    expect(createRoleSchema.safeParse({ name: "Teacher", description: "Can teach" }).success).toBe(true);
    expect(createRoleSchema.safeParse({ name: "Teacher", description: null }).success).toBe(true);
  });

  it("rejects invalid create role payloads", () => {
    expect(createRoleSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createRoleSchema.safeParse({ name: "x".repeat(101) }).success).toBe(false);
    expect(createRoleSchema.safeParse({ name: "Teacher", description: "x".repeat(501) }).success).toBe(false);
  });

  it("validates partial update role payloads", () => {
    expect(updateRoleSchema.safeParse({ name: "Admin" }).success).toBe(true);
    expect(updateRoleSchema.safeParse({ description: null }).success).toBe(true);
    expect(updateRoleSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid update role payloads", () => {
    expect(updateRoleSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateRoleSchema.safeParse({ description: "x".repeat(501) }).success).toBe(false);
  });
});
