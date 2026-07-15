import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "../../../src/modules/profiles/validators/update-profile.validator.js";

describe("UpdateProfile Validator", () => {
  it("should validate valid input", () => {
    const input = {
      phone: "123456789",
      avatarUrl: "https://example.com/avatar.jpg",
      bio: "Hello, I am a developer.",
    };
    expect(updateProfileSchema.safeParse(input).success).toBe(true);
  });

  it("should allow partial updates", () => {
    expect(updateProfileSchema.safeParse({ bio: "New bio" }).success).toBe(true);
  });

  it("should fail for invalid URL", () => {
    const input = { avatarUrl: "not-a-url" };
    expect(updateProfileSchema.safeParse(input).success).toBe(false);
  });

  it("should fail for exceeding length", () => {
    const input = { bio: "a".repeat(1001) };
    expect(updateProfileSchema.safeParse(input).success).toBe(false);
  });

  it("should allow null or empty values if nullable", () => {
    const input = { phone: null, avatarUrl: null, bio: null };
    expect(updateProfileSchema.safeParse(input).success).toBe(true);
  });
});
