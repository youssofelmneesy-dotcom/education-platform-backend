import { describe, expect, it } from "vitest";

import { courseListQuerySchema } from "../../../src/modules/courses/validators/course-list-query.validator.js";
import {
  assignCourseInstructorSchema,
  replaceCourseCategoriesSchema,
  replaceCourseInstructorsSchema,
  replaceCourseTagsSchema,
} from "../../../src/modules/courses/validators/course-relations.validator.js";
import {
  courseCategoryParamsSchema,
  courseIdParamsSchema,
  courseInstructorParamsSchema,
  courseTagParamsSchema,
} from "../../../src/modules/courses/validators/course-params.validator.js";
import { createCourseSchema } from "../../../src/modules/courses/validators/create-course.validator.js";
import { updateCourseStatusSchema } from "../../../src/modules/courses/validators/update-course-status.validator.js";
import { updateCourseSchema } from "../../../src/modules/courses/validators/update-course.validator.js";

const uuid = "00000000-0000-0000-0000-000000000000";

describe("Courses Validators", () => {
  describe("createCourseSchema", () => {
    it("should pass for a valid course payload", () => {
      // Arrange
      const payload = {
        title: "TypeScript Fundamentals",
        slug: "typescript-fundamentals",
        description: "A complete course",
        shortDescription: "Learn TypeScript",
        thumbnailUrl: "https://example.com/thumb.png",
        status: "draft",
        language: "en",
        durationSeconds: 3600,
      };

      // Act
      const result = createCourseSchema.safeParse(payload);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should default status to draft", () => {
      // Arrange
      const payload = { title: "Course", slug: "course" };

      // Act
      const result = createCourseSchema.safeParse(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("draft");
    });

    it("should fail when required fields are missing or empty", () => {
      // Act & Assert
      expect(createCourseSchema.safeParse({ slug: "course" }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course" }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "", slug: "course" }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course", slug: "" }).success).toBe(false);
    });

    it("should fail when field limits are exceeded", () => {
      // Act & Assert
      expect(createCourseSchema.safeParse({ title: "a".repeat(201), slug: "course" }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course", slug: "a".repeat(221) }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course", slug: "course", shortDescription: "a".repeat(501) }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course", slug: "course", description: "a".repeat(5001) }).success).toBe(false);
    });

    it("should fail for invalid duration values", () => {
      // Act & Assert
      expect(createCourseSchema.safeParse({ title: "Course", slug: "course", durationSeconds: -1 }).success).toBe(false);
      expect(createCourseSchema.safeParse({ title: "Course", slug: "course", durationSeconds: 1.5 }).success).toBe(false);
    });
  });

  describe("updateCourseSchema", () => {
    it("should pass for partial updates", () => {
      // Act
      const result = updateCourseSchema.safeParse({ title: "Updated Course" });

      // Assert
      expect(result.success).toBe(true);
    });

    it("should allow empty update payloads", () => {
      // Act & Assert
      expect(updateCourseSchema.safeParse({}).success).toBe(true);
    });

    it("should fail for invalid update fields", () => {
      // Act & Assert
      expect(updateCourseSchema.safeParse({ title: "" }).success).toBe(false);
      expect(updateCourseSchema.safeParse({ slug: "" }).success).toBe(false);
      expect(updateCourseSchema.safeParse({ durationSeconds: -1 }).success).toBe(false);
    });
  });

  describe("courseListQuerySchema", () => {
    it("should coerce pagination and apply defaults", () => {
      // Act
      const result = courseListQuerySchema.safeParse({ page: "2", limit: "25" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        page: 2,
        limit: 25,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should fail for invalid filters and sorting", () => {
      // Act & Assert
      expect(courseListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(courseListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(courseListQuerySchema.safeParse({ status: "unknown" }).success).toBe(false);
      expect(courseListQuerySchema.safeParse({ sortBy: "unknown" }).success).toBe(false);
      expect(courseListQuerySchema.safeParse({ categoryId: "not-a-uuid" }).success).toBe(false);
    });
  });

  describe("params schemas", () => {
    it("should pass valid uuid params", () => {
      // Act & Assert
      expect(courseIdParamsSchema.safeParse({ id: uuid }).success).toBe(true);
      expect(courseCategoryParamsSchema.safeParse({ id: uuid, categoryId: uuid }).success).toBe(true);
      expect(courseTagParamsSchema.safeParse({ id: uuid, tagId: uuid }).success).toBe(true);
      expect(courseInstructorParamsSchema.safeParse({ id: uuid, userId: uuid }).success).toBe(true);
    });

    it("should fail invalid uuid params", () => {
      // Act & Assert
      expect(courseIdParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
      expect(courseCategoryParamsSchema.safeParse({ id: uuid, categoryId: "bad-id" }).success).toBe(false);
      expect(courseTagParamsSchema.safeParse({ id: uuid, tagId: "bad-id" }).success).toBe(false);
      expect(courseInstructorParamsSchema.safeParse({ id: uuid, userId: "bad-id" }).success).toBe(false);
    });
  });

  describe("updateCourseStatusSchema", () => {
    it("should pass supported statuses", () => {
      // Act & Assert
      expect(updateCourseStatusSchema.safeParse({ status: "draft" }).success).toBe(true);
      expect(updateCourseStatusSchema.safeParse({ status: "published" }).success).toBe(true);
      expect(updateCourseStatusSchema.safeParse({ status: "archived" }).success).toBe(true);
    });

    it("should fail unsupported statuses", () => {
      // Act & Assert
      expect(updateCourseStatusSchema.safeParse({ status: "deleted" }).success).toBe(false);
    });
  });

  describe("relation schemas", () => {
    it("should pass valid relation payloads and defaults", () => {
      // Act
      const categories = replaceCourseCategoriesSchema.safeParse({});
      const tags = replaceCourseTagsSchema.safeParse({});
      const instructor = assignCourseInstructorSchema.safeParse({ userId: uuid });
      const instructors = replaceCourseInstructorsSchema.safeParse({ instructors: [{ userId: uuid }] });

      // Assert
      expect(categories.success).toBe(true);
      expect(categories.data?.categoryIds).toEqual([]);
      expect(tags.success).toBe(true);
      expect(tags.data?.tagIds).toEqual([]);
      expect(instructor.success).toBe(true);
      expect(instructor.data?.isPrimary).toBe(false);
      expect(instructors.success).toBe(true);
      expect(instructors.data?.instructors[0]?.isPrimary).toBe(false);
    });

    it("should fail invalid relation ids", () => {
      // Act & Assert
      expect(replaceCourseCategoriesSchema.safeParse({ categoryIds: ["bad-id"] }).success).toBe(false);
      expect(replaceCourseTagsSchema.safeParse({ tagIds: ["bad-id"] }).success).toBe(false);
      expect(assignCourseInstructorSchema.safeParse({ userId: "bad-id" }).success).toBe(false);
      expect(replaceCourseInstructorsSchema.safeParse({ instructors: [{ userId: "bad-id" }] }).success).toBe(false);
    });
  });
});
