import { describe, expect, it } from "vitest";
import { createCategorySchema } from "../../../src/modules/categories/validators/create-category.validator.js";
import { updateCategorySchema } from "../../../src/modules/categories/validators/update-category.validator.js";

describe("Categories Validators", () => {
  describe("createCategorySchema", () => {
    it("should pass for a valid category payload", () => {
      const payload = {
        name: "Development",
        slug: "development",
        description: "All development related courses",
      };

      const result = createCategorySchema.safeParse(payload);

      expect(result.success).toBe(true);
    });

    it("should allow description to be omitted or null", () => {
      const withoutDesc = { name: "Marketing", slug: "marketing" };
      const withNullDesc = { name: "Design", slug: "design", description: null };

      expect(createCategorySchema.safeParse(withoutDesc).success).toBe(true);
      expect(createCategorySchema.safeParse(withNullDesc).success).toBe(true);
    });

    it("should fail when name is empty, missing, or not a string", () => {
      expect(createCategorySchema.safeParse({ slug: "slug" }).success).toBe(false);
      expect(createCategorySchema.safeParse({ name: "", slug: "slug" }).success).toBe(false);
      expect(createCategorySchema.safeParse({ name: 123, slug: "slug" }).success).toBe(false);
    });

    it("should fail when slug is empty, missing, or not a string", () => {
      expect(createCategorySchema.safeParse({ name: "Name" }).success).toBe(false);
      expect(createCategorySchema.safeParse({ name: "Name", slug: "" }).success).toBe(false);
      expect(createCategorySchema.safeParse({ name: "Name", slug: 123 }).success).toBe(false);
    });

    it("should fail when name exceeds maximum length (100)", () => {
      const longName = "a".repeat(101);
      const payload = { name: longName, slug: "valid-slug" };

      expect(createCategorySchema.safeParse(payload).success).toBe(false);
    });

    it("should fail when slug exceeds maximum length (120)", () => {
      const longSlug = "a".repeat(121);
      const payload = { name: "Valid Name", slug: longSlug };

      expect(createCategorySchema.safeParse(payload).success).toBe(false);
    });

    it("should fail when description exceeds maximum length (500)", () => {
      const longDesc = "a".repeat(501);
      const payload = { name: "Valid Name", slug: "valid-slug", description: longDesc };

      expect(createCategorySchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("updateCategorySchema", () => {
    it("should pass for a valid partial category update payload", () => {
      const payload = {
        name: "Updated Development",
      };

      const result = updateCategorySchema.safeParse(payload);

      expect(result.success).toBe(true);
    });

    it("should allow all fields to be optional", () => {
      const payload = {};

      const result = updateCategorySchema.safeParse(payload);

      expect(result.success).toBe(true);
    });

    it("should fail when name is empty or not a string", () => {
      expect(updateCategorySchema.safeParse({ name: "" }).success).toBe(false);
      expect(updateCategorySchema.safeParse({ name: 123 }).success).toBe(false);
    });

    it("should fail when slug is empty or not a string", () => {
      expect(updateCategorySchema.safeParse({ slug: "" }).success).toBe(false);
      expect(updateCategorySchema.safeParse({ slug: 123 }).success).toBe(false);
    });

    it("should fail when name exceeds max length (100)", () => {
      expect(updateCategorySchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
    });

    it("should fail when slug exceeds max length (120)", () => {
      expect(updateCategorySchema.safeParse({ slug: "a".repeat(121) }).success).toBe(false);
    });

    it("should fail when description exceeds max length (500)", () => {
      expect(updateCategorySchema.safeParse({ description: "a".repeat(501) }).success).toBe(false);
    });
  });
});
