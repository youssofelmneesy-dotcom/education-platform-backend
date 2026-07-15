import { describe, expect, it } from "vitest";

import {
  courseIdParamsSchema,
  lessonIdParamsSchema,
  lessonNoteSchema,
  limitQuerySchema,
  noteIdParamsSchema,
  paginationQuerySchema,
  updateLessonProgressSchema,
} from "../../../src/modules/student-learning/validators/index.js";

const uuid = "00000000-0000-0000-0000-000000000000";

describe("Student Learning Validators", () => {
  describe("params schemas", () => {
    it("should pass valid uuid params", () => {
      // Act & Assert
      expect(lessonIdParamsSchema.safeParse({ lessonId: uuid }).success).toBe(true);
      expect(noteIdParamsSchema.safeParse({ id: uuid }).success).toBe(true);
      expect(courseIdParamsSchema.safeParse({ courseId: uuid }).success).toBe(true);
    });

    it("should fail invalid uuid params", () => {
      // Act & Assert
      expect(lessonIdParamsSchema.safeParse({ lessonId: "bad-id" }).success).toBe(false);
      expect(noteIdParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
      expect(courseIdParamsSchema.safeParse({ courseId: "bad-id" }).success).toBe(false);
    });
  });

  describe("updateLessonProgressSchema", () => {
    it("should pass valid progress payloads", () => {
      // Act & Assert
      expect(updateLessonProgressSchema.safeParse({ watchedSeconds: 120, progressPercent: 50 }).success).toBe(true);
      expect(updateLessonProgressSchema.safeParse({ watchedSeconds: 0, progressPercent: 100 }).success).toBe(true);
    });

    it("should fail invalid progress payloads", () => {
      // Act & Assert
      expect(updateLessonProgressSchema.safeParse({ watchedSeconds: -1, progressPercent: 50 }).success).toBe(false);
      expect(updateLessonProgressSchema.safeParse({ watchedSeconds: 1.5, progressPercent: 50 }).success).toBe(false);
      expect(updateLessonProgressSchema.safeParse({ watchedSeconds: 10, progressPercent: 101 }).success).toBe(false);
    });
  });

  describe("lessonNoteSchema", () => {
    it("should pass valid note content", () => {
      // Act & Assert
      expect(lessonNoteSchema.safeParse({ content: "Useful note" }).success).toBe(true);
    });

    it("should fail invalid note content", () => {
      // Act & Assert
      expect(lessonNoteSchema.safeParse({ content: "" }).success).toBe(false);
      expect(lessonNoteSchema.safeParse({ content: "a".repeat(10001) }).success).toBe(false);
    });
  });

  describe("query schemas", () => {
    it("should coerce pagination and limit queries", () => {
      // Act
      const pagination = paginationQuerySchema.safeParse({ page: "2", limit: "25", search: "note" });
      const limit = limitQuerySchema.safeParse({ limit: "5" });

      // Assert
      expect(pagination.success).toBe(true);
      expect(pagination.data).toMatchObject({ page: 2, limit: 25, search: "note" });
      expect(limit.success).toBe(true);
      expect(limit.data?.limit).toBe(5);
    });

    it("should apply defaults", () => {
      // Act
      const pagination = paginationQuerySchema.safeParse({});
      const limit = limitQuerySchema.safeParse({});

      // Assert
      expect(pagination.data).toMatchObject({ page: 1, limit: 10 });
      expect(limit.data?.limit).toBe(10);
    });

    it("should fail invalid query values", () => {
      // Act & Assert
      expect(paginationQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ search: "" }).success).toBe(false);
      expect(limitQuerySchema.safeParse({ limit: "0" }).success).toBe(false);
      expect(limitQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
    });
  });
});
