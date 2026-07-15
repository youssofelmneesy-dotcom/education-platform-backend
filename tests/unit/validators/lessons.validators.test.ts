import { describe, expect, it } from "vitest";

import { createLessonSchema } from "../../../src/modules/lessons/validators/create-lesson.validator.js";
import { lessonListQuerySchema } from "../../../src/modules/lessons/validators/lesson-list-query.validator.js";
import { courseLessonsParamsSchema, lessonParamsSchema } from "../../../src/modules/lessons/validators/lesson-params.validator.js";
import { reorderLessonsSchema } from "../../../src/modules/lessons/validators/reorder-lessons.validator.js";
import { updateLessonStatusSchema } from "../../../src/modules/lessons/validators/update-lesson-status.validator.js";
import { updateLessonSchema } from "../../../src/modules/lessons/validators/update-lesson.validator.js";

const uuid = "00000000-0000-0000-0000-000000000000";

describe("Lessons Validators", () => {
  describe("createLessonSchema", () => {
    it("should pass valid lesson payloads and apply defaults", () => {
      // Act
      const result = createLessonSchema.safeParse({
        courseId: uuid,
        title: "Introduction",
        slug: "introduction",
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.sortOrder).toBe(0);
      expect(result.data?.isPreview).toBe(false);
    });

    it("should fail invalid required fields and limits", () => {
      // Act & Assert
      expect(createLessonSchema.safeParse({ title: "Lesson", slug: "lesson" }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "", slug: "lesson" }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "Lesson", slug: "" }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "a".repeat(201), slug: "lesson" }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "Lesson", slug: "a".repeat(221) }).success).toBe(false);
    });

    it("should fail invalid numeric fields", () => {
      // Act & Assert
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "Lesson", slug: "lesson", sortOrder: -1 }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "Lesson", slug: "lesson", durationSeconds: -1 }).success).toBe(false);
      expect(createLessonSchema.safeParse({ courseId: uuid, title: "Lesson", slug: "lesson", durationSeconds: 1.5 }).success).toBe(false);
    });
  });

  describe("updateLessonSchema", () => {
    it("should pass partial updates", () => {
      // Act & Assert
      expect(updateLessonSchema.safeParse({ title: "Updated" }).success).toBe(true);
      expect(updateLessonSchema.safeParse({}).success).toBe(true);
    });

    it("should fail invalid updates", () => {
      // Act & Assert
      expect(updateLessonSchema.safeParse({ title: "" }).success).toBe(false);
      expect(updateLessonSchema.safeParse({ slug: "" }).success).toBe(false);
      expect(updateLessonSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
    });
  });

  describe("lessonListQuerySchema", () => {
    it("should coerce pagination and apply defaults", () => {
      // Act
      const result = lessonListQuerySchema.safeParse({ page: "2", limit: "20", isPreview: "true" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        page: 2,
        limit: 20,
        isPreview: true,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
    });

    it("should fail invalid filters and sorting", () => {
      // Act & Assert
      expect(lessonListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(lessonListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(lessonListQuerySchema.safeParse({ status: "archived" }).success).toBe(false);
      expect(lessonListQuerySchema.safeParse({ sortBy: "unknown" }).success).toBe(false);
    });
  });

  describe("params schemas", () => {
    it("should pass valid uuid params", () => {
      // Act & Assert
      expect(courseLessonsParamsSchema.safeParse({ courseId: uuid }).success).toBe(true);
      expect(lessonParamsSchema.safeParse({ courseId: uuid, id: uuid }).success).toBe(true);
    });

    it("should fail invalid uuid params", () => {
      // Act & Assert
      expect(courseLessonsParamsSchema.safeParse({ courseId: "bad-id" }).success).toBe(false);
      expect(lessonParamsSchema.safeParse({ courseId: uuid, id: "bad-id" }).success).toBe(false);
    });
  });

  describe("reorderLessonsSchema", () => {
    it("should pass non-empty uuid arrays", () => {
      // Act & Assert
      expect(reorderLessonsSchema.safeParse({ lessonIds: [uuid] }).success).toBe(true);
    });

    it("should fail empty or invalid arrays", () => {
      // Act & Assert
      expect(reorderLessonsSchema.safeParse({ lessonIds: [] }).success).toBe(false);
      expect(reorderLessonsSchema.safeParse({ lessonIds: ["bad-id"] }).success).toBe(false);
    });
  });

  describe("updateLessonStatusSchema", () => {
    it("should pass supported statuses", () => {
      // Act & Assert
      expect(updateLessonStatusSchema.safeParse({ status: "draft" }).success).toBe(true);
      expect(updateLessonStatusSchema.safeParse({ status: "published" }).success).toBe(true);
    });

    it("should fail unsupported statuses", () => {
      // Act & Assert
      expect(updateLessonStatusSchema.safeParse({ status: "archived" }).success).toBe(false);
    });
  });
});
