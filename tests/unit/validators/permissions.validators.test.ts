import { describe, expect, it } from "vitest";

import { createPermissionSchema, updatePermissionSchema } from "../../../src/modules/permissions/validators/index.js";

describe("permissions validators", () => {
  it("validates create permission payloads", () => {
    expect(createPermissionSchema.safeParse({ resource: "courses", action: "read", description: "Can read courses" }).success).toBe(true);
    expect(createPermissionSchema.safeParse({ resource: "courses", action: "read", description: null }).success).toBe(true);
  });

  it("rejects invalid create permission payloads", () => {
    expect(createPermissionSchema.safeParse({ resource: "", action: "read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ resource: "courses", action: "" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ resource: "x".repeat(101), action: "read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ resource: "courses", action: "read", description: "x".repeat(501) }).success).toBe(false);
  });

  it("validates partial update permission payloads", () => {
    expect(updatePermissionSchema.safeParse({ resource: "lessons" }).success).toBe(true);
    expect(updatePermissionSchema.safeParse({ action: "update" }).success).toBe(true);
    expect(updatePermissionSchema.safeParse({ description: null }).success).toBe(true);
    expect(updatePermissionSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid update permission payloads", () => {
    expect(updatePermissionSchema.safeParse({ resource: "" }).success).toBe(false);
    expect(updatePermissionSchema.safeParse({ action: "" }).success).toBe(false);
    expect(updatePermissionSchema.safeParse({ description: "x".repeat(501) }).success).toBe(false);
  });
});
