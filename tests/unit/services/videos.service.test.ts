import { beforeEach, describe, expect, it, vi } from "vitest";

import { VideosService } from "../../../src/modules/videos/services/videos.service.js";
import type { IVideosRepository } from "../../../src/modules/videos/interfaces/index.js";
import {
  LessonNotFoundError,
  VideoAlreadyExistsForLessonError,
  VideoChapterNotFoundError,
  VideoNotFoundError,
  VideoSubtitleNotFoundError,
} from "../../../src/modules/videos/utils/index.js";

function createRepositoryMock(): IVideosRepository & Record<string, ReturnType<typeof vi.fn>> {
  return {
    lessonExists: vi.fn(),
    findByLessonId: vi.fn(),
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    softDeleteById: vi.fn(),
    getPreviousVideo: vi.fn(),
    getNextVideo: vi.fn(),
    listLessonVideos: vi.fn(),
    createChapter: vi.fn(),
    listChapters: vi.fn(),
    findChapterById: vi.fn(),
    updateChapter: vi.fn(),
    deleteChapter: vi.fn(),
    createSubtitle: vi.fn(),
    listSubtitles: vi.fn(),
    findSubtitleById: vi.fn(),
    updateSubtitle: vi.fn(),
    deleteSubtitle: vi.fn(),
    getStatistics: vi.fn(),
  } as IVideosRepository & Record<string, ReturnType<typeof vi.fn>>;
}

function createVideoRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "video-123",
    tenantId: "tenant-123",
    lessonId: "lesson-123",
    title: "Intro Video",
    sourceUrl: "https://example.com/video.mp4",
    thumbnailUrl: "https://example.com/thumb.png",
    durationSeconds: 600,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

function createChapterRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "chapter-123",
    tenantId: "tenant-123",
    videoId: "video-123",
    title: "Intro",
    startSecond: 0,
    sortOrder: 1,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

function createSubtitleRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "subtitle-123",
    tenantId: "tenant-123",
    videoId: "video-123",
    language: "en",
    label: "English",
    fileUrl: "https://example.com/en.vtt",
    isDefault: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

describe("VideosService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: VideosService;
  const tenantId = "tenant-123";
  const lessonId = "lesson-123";
  const videoId = "video-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new VideosService(repository);
  });

  describe("videos", () => {
    it("should create a video", async () => {
      // Arrange
      const input = { lessonId, sourceUrl: "https://example.com/video.mp4" };
      repository.lessonExists.mockResolvedValue(true);
      repository.findByLessonId.mockResolvedValue(null);
      repository.create.mockResolvedValue(createVideoRecord());

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(repository.lessonExists).toHaveBeenCalledWith(lessonId, tenantId);
      expect(repository.findByLessonId).toHaveBeenCalledWith(lessonId, tenantId);
      expect(result).toMatchObject({
        id: videoId,
        lessonId,
        sourceUrl: input.sourceUrl,
        playbackUrl: input.sourceUrl,
      });
    });

    it("should reject create when lesson does not exist", async () => {
      // Arrange
      repository.lessonExists.mockResolvedValue(false);

      // Act & Assert
      await expect(service.create(tenantId, { lessonId, sourceUrl: "https://example.com/video.mp4" })).rejects.toThrow(LessonNotFoundError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should reject create when lesson already has a video", async () => {
      // Arrange
      repository.lessonExists.mockResolvedValue(true);
      repository.findByLessonId.mockResolvedValue(createVideoRecord());

      // Act & Assert
      await expect(service.create(tenantId, { lessonId, sourceUrl: "https://example.com/video.mp4" })).rejects.toThrow(VideoAlreadyExistsForLessonError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should list videos", async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      repository.list.mockResolvedValue({ videos: [createVideoRecord()], total: 1 });

      // Act
      const result = await service.list(tenantId, query);

      // Assert
      expect(repository.list).toHaveBeenCalledWith(tenantId, query);
      expect(result.total).toBe(1);
      expect(result.videos[0]?.id).toBe(videoId);
    });

    it("should return a video by id", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());

      // Act
      const result = await service.getById(videoId, tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(videoId, tenantId);
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should throw when video is not found by id", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById(videoId, tenantId)).rejects.toThrow(VideoNotFoundError);
    });

    it("should update a video", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.updateById.mockResolvedValue(createVideoRecord({ title: "Updated" }));

      // Act
      const result = await service.updateById(videoId, tenantId, { title: "Updated" });

      // Assert
      expect(repository.updateById).toHaveBeenCalledWith(videoId, tenantId, { title: "Updated" });
      expect(result.title).toBe("Updated");
    });

    it("should delete a video", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.deleteById(videoId, tenantId);

      // Assert
      expect(repository.softDeleteById).toHaveBeenCalledWith(videoId, tenantId);
    });

    it("should return previous, next, and lesson videos", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.getPreviousVideo.mockResolvedValue(createVideoRecord({ id: "previous-video" }));
      repository.getNextVideo.mockResolvedValue(null);
      repository.lessonExists.mockResolvedValue(true);
      repository.listLessonVideos.mockResolvedValue([createVideoRecord()]);

      // Act
      const previous = await service.getPreviousVideo(videoId, tenantId);
      const next = await service.getNextVideo(videoId, tenantId);
      const lessonVideos = await service.listLessonVideos(lessonId, tenantId);

      // Assert
      expect(previous?.id).toBe("previous-video");
      expect(next).toBeNull();
      expect(lessonVideos).toHaveLength(1);
    });
  });

  describe("chapters", () => {
    it("should create, list, get, update, and delete chapters", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.createChapter.mockResolvedValue(createChapterRecord());
      repository.listChapters.mockResolvedValue([createChapterRecord()]);
      repository.findChapterById.mockResolvedValue(createChapterRecord());
      repository.updateChapter.mockResolvedValue(createChapterRecord({ title: "Updated Chapter" }));
      repository.deleteChapter.mockResolvedValue(true);

      // Act
      const created = await service.createChapter(videoId, tenantId, { title: "Intro", startSecond: 0 });
      const list = await service.listChapters(videoId, tenantId);
      const found = await service.getChapterById(videoId, "chapter-123", tenantId);
      const updated = await service.updateChapter(videoId, "chapter-123", tenantId, { title: "Updated Chapter" });
      await service.deleteChapter(videoId, "chapter-123", tenantId);

      // Assert
      expect(created.id).toBe("chapter-123");
      expect(list).toHaveLength(1);
      expect(found.id).toBe("chapter-123");
      expect(updated.title).toBe("Updated Chapter");
      expect(repository.deleteChapter).toHaveBeenCalledWith(videoId, "chapter-123", tenantId);
    });

    it("should throw when chapter is not found", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.findChapterById.mockResolvedValue(null);
      repository.updateChapter.mockResolvedValue(null);
      repository.deleteChapter.mockResolvedValue(false);

      // Act & Assert
      await expect(service.getChapterById(videoId, "missing", tenantId)).rejects.toThrow(VideoChapterNotFoundError);
      await expect(service.updateChapter(videoId, "missing", tenantId, { title: "Missing" })).rejects.toThrow(VideoChapterNotFoundError);
      await expect(service.deleteChapter(videoId, "missing", tenantId)).rejects.toThrow(VideoChapterNotFoundError);
    });
  });

  describe("subtitles", () => {
    it("should create, list, get, update, and delete subtitles", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.createSubtitle.mockResolvedValue(createSubtitleRecord());
      repository.listSubtitles.mockResolvedValue([createSubtitleRecord()]);
      repository.findSubtitleById.mockResolvedValue(createSubtitleRecord());
      repository.updateSubtitle.mockResolvedValue(createSubtitleRecord({ label: "Updated English" }));
      repository.deleteSubtitle.mockResolvedValue(true);

      // Act
      const created = await service.createSubtitle(videoId, tenantId, { language: "en", fileUrl: "https://example.com/en.vtt" });
      const list = await service.listSubtitles(videoId, tenantId);
      const found = await service.getSubtitleById(videoId, "subtitle-123", tenantId);
      const updated = await service.updateSubtitle(videoId, "subtitle-123", tenantId, { label: "Updated English" });
      await service.deleteSubtitle(videoId, "subtitle-123", tenantId);

      // Assert
      expect(created.id).toBe("subtitle-123");
      expect(list).toHaveLength(1);
      expect(found.id).toBe("subtitle-123");
      expect(updated.label).toBe("Updated English");
      expect(repository.deleteSubtitle).toHaveBeenCalledWith(videoId, "subtitle-123", tenantId);
    });

    it("should throw when subtitle is not found", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createVideoRecord());
      repository.findSubtitleById.mockResolvedValue(null);
      repository.updateSubtitle.mockResolvedValue(null);
      repository.deleteSubtitle.mockResolvedValue(false);

      // Act & Assert
      await expect(service.getSubtitleById(videoId, "missing", tenantId)).rejects.toThrow(VideoSubtitleNotFoundError);
      await expect(service.updateSubtitle(videoId, "missing", tenantId, { label: "Missing" })).rejects.toThrow(VideoSubtitleNotFoundError);
      await expect(service.deleteSubtitle(videoId, "missing", tenantId)).rejects.toThrow(VideoSubtitleNotFoundError);
    });
  });

  describe("statistics", () => {
    it("should return repository statistics", async () => {
      // Arrange
      const statistics = { totalVideos: 1, totalDurationSeconds: 600, averageDurationSeconds: 600 };
      repository.getStatistics.mockResolvedValue(statistics);

      // Act
      const result = await service.getStatistics(tenantId);

      // Assert
      expect(repository.getStatistics).toHaveBeenCalledWith(tenantId);
      expect(result).toBe(statistics);
    });
  });
});
