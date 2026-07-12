import { describe, it, expect } from "vitest";
import { prisma } from "../../src/database/index.js";

describe("Testing environment smoke", () => {
  it("should run in test env and connect to the database", async () => {
    expect(process.env.NODE_ENV).toBe("test");

    // simple DB check
    const res = await prisma.$queryRawUnsafe("SELECT 1 as v");
    expect(res).toBeDefined();
  });
});
