import { describe, expect, it } from "vitest";

import { createVideoSchema } from "../../../src/modules/videos/validators/create-video.validator.js";
import { updateVideoSchema } from "../../../src/modules/videos/validators/update-video.validator.js";
import { videoListQuerySchema } from "../../../src/modules/videos/validators/video-list-query.validator.js";
import {
  lessonIdParamsSchema,
  videoChapterParamsSchema,
  videoIdParamsSchema,
  videoSubtitleParamsSchema,
} from "../../../src/modules/videos/validators/video-params.validator.js";
import { createVideoChapterSchema, updateVideoChapterSchema } from "../../../src/modules/videos/validators/video-chapter.validator.js";
import { createVideoSubtitleSchema, updateVideoSubtitleSchema } from "../../../src/modules/videos/validators/video-subtitle.validator.js";

const uuid = "00000000-0000-0000-0000-000000000000";

describe("Videos Validators", () => {
  describe("video schemas", () => {
    it("should pass valid create and update payloads", () => {
      // Act & Assert
      expect(createVideoSchema.safeParse({ lessonId: uuid, sourceUrl: "https://example.com/video.mp4" }).success).toBe(true);
      expect(updateVideoSchema.safeParse({ title: "Updated", durationSeconds: 60 }).success).toBe(true);
    });

    it("should fail invalid video payloads", () => {
      // Act & Assert
      expect(createVideoSchema.safeParse({ lessonId: "bad-id", sourceUrl: "https://example.com/video.mp4" }).success).toBe(false);
      expect(createVideoSchema.safeParse({ lessonId: uuid, sourceUrl: "not-a-url" }).success).toBe(false);
      expect(updateVideoSchema.safeParse({ sourceUrl: "not-a-url" }).success).toBe(false);
      expect(updateVideoSchema.safeParse({ durationSeconds: -1 }).success).toBe(false);
    });
  });

  describe("videoListQuerySchema", () => {
    it("should coerce pagination and duration filters", () => {
      // Act
      const result = videoListQuerySchema.safeParse({ page: "2", limit: "20", minDurationSeconds: "10", maxDurationSeconds: "50" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        page: 2,
        limit: 20,
        minDurationSeconds: 10,
        maxDurationSeconds: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should fail invalid query values", () => {
      // Act & Assert
      expect(videoListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(videoListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(videoListQuerySchema.safeParse({ lessonId: "bad-id" }).success).toBe(false);
      expect(videoListQuerySchema.safeParse({ minDurationSeconds: "50", maxDurationSeconds: "10" }).success).toBe(false);
    });
  });

  describe("params schemas", () => {
    it("should pass valid uuid params", () => {
      // Act & Assert
      expect(videoIdParamsSchema.safeParse({ id: uuid }).success).toBe(true);
      expect(lessonIdParamsSchema.safeParse({ lessonId: uuid }).success).toBe(true);
      expect(videoChapterParamsSchema.safeParse({ id: uuid, chapterId: uuid }).success).toBe(true);
      expect(videoSubtitleParamsSchema.safeParse({ id: uuid, subtitleId: uuid }).success).toBe(true);
    });

    it("should fail invalid uuid params", () => {
      // Act & Assert
      expect(videoIdParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
      expect(lessonIdParamsSchema.safeParse({ lessonId: "bad-id" }).success).toBe(false);
      expect(videoChapterParamsSchema.safeParse({ id: uuid, chapterId: "bad-id" }).success).toBe(false);
      expect(videoSubtitleParamsSchema.safeParse({ id: uuid, subtitleId: "bad-id" }).success).toBe(false);
    });
  });

  describe("chapter schemas", () => {
    it("should pass valid chapter payloads", () => {
      // Act & Assert
      expect(createVideoChapterSchema.safeParse({ title: "Intro", startSecond: 0 }).success).toBe(true);
      expect(updateVideoChapterSchema.safeParse({ sortOrder: 2 }).success).toBe(true);
    });

    it("should fail invalid chapter payloads", () => {
      // Act & Assert
      expect(createVideoChapterSchema.safeParse({ title: "", startSecond: 0 }).success).toBe(false);
      expect(createVideoChapterSchema.safeParse({ title: "Intro", startSecond: -1 }).success).toBe(false);
      expect(updateVideoChapterSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
    });
  });

  describe("subtitle schemas", () => {
    it("should pass valid subtitle payloads", () => {
      // Act & Assert
      expect(createVideoSubtitleSchema.safeParse({ language: "en", fileUrl: "https://example.com/en.vtt" }).success).toBe(true);
      expect(updateVideoSubtitleSchema.safeParse({ label: "English" }).success).toBe(true);
    });

    it("should fail invalid subtitle payloads", () => {
      // Act & Assert
      expect(createVideoSubtitleSchema.safeParse({ language: "", fileUrl: "https://example.com/en.vtt" }).success).toBe(false);
      expect(createVideoSubtitleSchema.safeParse({ language: "en", fileUrl: "not-a-url" }).success).toBe(false);
      expect(updateVideoSubtitleSchema.safeParse({ fileUrl: "not-a-url" }).success).toBe(false);
    });
  });
});
