import { describe, expect, it } from "vitest";
import { updateUserSchema } from "../../../src/modules/users/validators/update-user.validator.js";

describe("UsersValidators", () => {
  describe("updateUserSchema", () => {
    it("should validate valid data", () => {
      const data = { firstName: "John", lastName: "Doe" };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should allow partial data", () => {
      const result1 = updateUserSchema.safeParse({ firstName: "John" });
      const result2 = updateUserSchema.safeParse({ lastName: "Doe" });
      const result3 = updateUserSchema.safeParse({});

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it("should reject invalid types", () => {
      const result = updateUserSchema.safeParse({ firstName: 123 });
      expect(result.success).toBe(false);
    });

    it("should reject empty strings if provided", () => {
      const result = updateUserSchema.safeParse({ firstName: "" });
      expect(result.success).toBe(false);
    });

    it("should reject too long strings", () => {
      const result = updateUserSchema.safeParse({ firstName: "a".repeat(51) });
      expect(result.success).toBe(false);
    });
  });
});
