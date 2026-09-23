import { describe, expect, it } from "vitest";

import { createTagSchema, updateTagSchema } from "../../../src/modules/tags/validators/index.js";

describe("tags validators", () => {
  it("validates create tag payloads", () => {
    expect(createTagSchema.safeParse({ name: "TypeScript", slug: "typescript" }).success).toBe(true);
  });

  it("rejects invalid create tag payloads", () => {
    expect(createTagSchema.safeParse({ name: "", slug: "typescript" }).success).toBe(false);
    expect(createTagSchema.safeParse({ name: "TypeScript", slug: "" }).success).toBe(false);
    expect(createTagSchema.safeParse({ name: "x".repeat(101), slug: "typescript" }).success).toBe(false);
    expect(createTagSchema.safeParse({ name: "TypeScript", slug: "x".repeat(121) }).success).toBe(false);
  });

  it("validates partial update tag payloads", () => {
    expect(updateTagSchema.safeParse({ name: "Node.js" }).success).toBe(true);
    expect(updateTagSchema.safeParse({ slug: "nodejs" }).success).toBe(true);
    expect(updateTagSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid update tag payloads", () => {
    expect(updateTagSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateTagSchema.safeParse({ slug: "" }).success).toBe(false);
  });
});
