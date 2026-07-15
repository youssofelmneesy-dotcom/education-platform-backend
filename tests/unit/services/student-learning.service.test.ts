import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IStudentLearningRepository } from "../../../src/modules/student-learning/interfaces/index.js";
import { StudentLearningService } from "../../../src/modules/student-learning/services/student-learning.service.js";
import {
  LearningResourceNotFoundError,
  LessonNoteNotFoundError,
  LessonProgressNotSupportedError,
} from "../../../src/modules/student-learning/utils/index.js";

function createRepositoryMock(): IStudentLearningRepository & Record<string, ReturnType<typeof vi.fn>> {
  return {
    findLessonVideo: vi.fn(),
    startLesson: vi.fn(),
    updateLessonProgress: vi.fn(),
    completeLesson: vi.fn(),
    markLessonIncomplete: vi.fn(),
    getLessonProgress: vi.fn(),
    getCourseProgress: vi.fn(),
    getRecentlyWatched: vi.fn(),
    getContinueWatching: vi.fn(),
    getLastWatchedInCourse: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    listLessonNotes: vi.fn(),
    listMyNotes: vi.fn(),
    bookmarkCourse: vi.fn(),
    removeCourseBookmark: vi.fn(),
    bookmarkLesson: vi.fn(),
    removeLessonBookmark: vi.fn(),
    listBookmarks: vi.fn(),
    getDashboard: vi.fn(),
  };
}

function createProgressRecord(overrides: Record<string, unknown> = {}) {
  return {
    watchedSeconds: 120,
    progressPercent: 50,
    completedAt: null,
    lastWatchedAt: new Date("2024-01-02T00:00:00.000Z"),
    video: {
      id: "video-123",
      lesson: {
        id: "lesson-123",
        courseId: "course-123",
      },
    },
    ...overrides,
  };
}

function createWatchedLessonRecord(overrides: Record<string, unknown> = {}) {
  return {
    watchedSeconds: 120,
    watchedAt: new Date("2024-01-02T00:00:00.000Z"),
    video: {
      id: "video-123",
      lesson: {
        id: "lesson-123",
        title: "Lesson 1",
        courseId: "course-123",
        course: {
          title: "Course 1",
        },
      },
    },
    ...overrides,
  };
}

function createNoteRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "note-123",
    lessonId: "lesson-123",
    content: "Great note",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    lesson: {
      courseId: "course-123",
    },
    ...overrides,
  };
}

function createBookmarkRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "bookmark-123",
    courseId: "course-123",
    lessonId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    course: {
      title: "Course 1",
    },
    lesson: null,
    ...overrides,
  };
}

describe("StudentLearningService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: StudentLearningService;
  const userId = "user-123";
  const tenantId = "tenant-123";
  const lessonId = "lesson-123";
  const courseId = "course-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new StudentLearningService(repository);
  });

  describe("lesson progress", () => {
    it("should start, update, complete, and mark a lesson incomplete", async () => {
      // Arrange
      repository.startLesson.mockResolvedValue(createProgressRecord({ watchedSeconds: 0, progressPercent: 0 }));
      repository.updateLessonProgress.mockResolvedValue(createProgressRecord({ watchedSeconds: 300, progressPercent: 75 }));
      repository.completeLesson.mockResolvedValue(
        createProgressRecord({
          watchedSeconds: 600,
          progressPercent: 100,
          completedAt: new Date("2024-01-03T00:00:00.000Z"),
        })
      );
      repository.markLessonIncomplete.mockResolvedValue(createProgressRecord({ watchedSeconds: 600, progressPercent: 0 }));

      // Act
      const started = await service.startLesson(userId, tenantId, lessonId);
      const updated = await service.updateLessonProgress(userId, tenantId, lessonId, { watchedSeconds: 300, progressPercent: 75 });
      const completed = await service.completeLesson(userId, tenantId, lessonId);
      const incomplete = await service.markLessonIncomplete(userId, tenantId, lessonId);

      // Assert
      expect(started.progressPercent).toBe(0);
      expect(updated.watchedSeconds).toBe(300);
      expect(completed.completedAt).toBe("2024-01-03T00:00:00.000Z");
      expect(incomplete.progressPercent).toBe(0);
    });

    it("should throw LessonProgressNotSupportedError when progress operations return null", async () => {
      // Arrange
      repository.startLesson.mockResolvedValue(null);

      // Act & Assert
      await expect(service.startLesson(userId, tenantId, lessonId)).rejects.toThrow(LessonProgressNotSupportedError);
    });

    it("should return default lesson progress when lesson has a video but no progress exists", async () => {
      // Arrange
      repository.findLessonVideo.mockResolvedValue({
        lessonId,
        courseId,
        videoId: "video-123",
        videoDurationSeconds: 600,
      });
      repository.getLessonProgress.mockResolvedValue(null);

      // Act
      const result = await service.getLessonProgress(userId, tenantId, lessonId);

      // Assert
      expect(result).toEqual({
        lessonId,
        courseId,
        videoId: "video-123",
        watchedSeconds: 0,
        progressPercent: 0,
        completedAt: null,
        lastWatchedAt: null,
      });
    });

    it("should throw LessonProgressNotSupportedError when lesson has no video", async () => {
      // Arrange
      repository.findLessonVideo.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getLessonProgress(userId, tenantId, lessonId)).rejects.toThrow(LessonProgressNotSupportedError);
    });

    it("should calculate course progress percentage and remaining lessons", async () => {
      // Arrange
      repository.getCourseProgress.mockResolvedValue({ courseId, totalLessons: 4, completedLessons: 3 });

      // Act
      const result = await service.getCourseProgress(userId, tenantId, courseId);

      // Assert
      expect(result).toEqual({
        courseId,
        totalLessons: 4,
        completedLessons: 3,
        remainingLessons: 1,
        progressPercentage: 75,
      });
    });
  });

  describe("watching lists", () => {
    it("should map recently watched, continue watching, and last watched lessons", async () => {
      // Arrange
      repository.getRecentlyWatched.mockResolvedValue([createWatchedLessonRecord()]);
      repository.getContinueWatching.mockResolvedValue([createProgressRecord()]);
      repository.getLastWatchedInCourse.mockResolvedValue(createWatchedLessonRecord());

      // Act
      const recent = await service.getRecentlyWatched(userId, tenantId, 5);
      const current = await service.getContinueWatching(userId, tenantId, 5);
      const last = await service.getLastWatchedInCourse(userId, tenantId, courseId);

      // Assert
      expect(recent[0]).toMatchObject({ lessonId, courseId, videoId: "video-123", title: "Lesson 1", courseTitle: "Course 1" });
      expect(current[0]).toMatchObject({ lessonId, courseId, videoId: "video-123" });
      expect(last?.lessonId).toBe(lessonId);
    });

    it("should return null when no last watched lesson exists", async () => {
      // Arrange
      repository.getLastWatchedInCourse.mockResolvedValue(null);

      // Act
      const result = await service.getLastWatchedInCourse(userId, tenantId, courseId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("notes", () => {
    it("should create, update, delete, and list notes", async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      repository.findLessonVideo.mockResolvedValue({ lessonId, courseId, videoId: "video-123", videoDurationSeconds: 600 });
      repository.createNote.mockResolvedValue(createNoteRecord());
      repository.updateNote.mockResolvedValue(createNoteRecord({ content: "Updated note" }));
      repository.deleteNote.mockResolvedValue(true);
      repository.listLessonNotes.mockResolvedValue({ notes: [createNoteRecord()], total: 1 });
      repository.listMyNotes.mockResolvedValue({ notes: [createNoteRecord()], total: 1 });

      // Act
      const created = await service.createNote(userId, tenantId, lessonId, "Great note");
      const updated = await service.updateNote(userId, tenantId, "note-123", "Updated note");
      await service.deleteNote(userId, tenantId, "note-123");
      const lessonNotes = await service.listLessonNotes(userId, tenantId, lessonId, query);
      const myNotes = await service.listMyNotes(userId, tenantId, query);

      // Assert
      expect(created.content).toBe("Great note");
      expect(updated.content).toBe("Updated note");
      expect(repository.deleteNote).toHaveBeenCalledWith(userId, tenantId, "note-123");
      expect(lessonNotes.total).toBe(1);
      expect(myNotes.total).toBe(1);
    });

    it("should throw when creating a note for a missing lesson", async () => {
      // Arrange
      repository.findLessonVideo.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createNote(userId, tenantId, lessonId, "Note")).rejects.toThrow(LearningResourceNotFoundError);
    });

    it("should throw when updating or deleting a missing note", async () => {
      // Arrange
      repository.updateNote.mockResolvedValue(null);
      repository.deleteNote.mockResolvedValue(false);

      // Act & Assert
      await expect(service.updateNote(userId, tenantId, "missing-note", "Note")).rejects.toThrow(LessonNoteNotFoundError);
      await expect(service.deleteNote(userId, tenantId, "missing-note")).rejects.toThrow(LessonNoteNotFoundError);
    });
  });

  describe("bookmarks", () => {
    it("should bookmark and remove courses and lessons", async () => {
      // Arrange
      repository.bookmarkCourse.mockResolvedValue(createBookmarkRecord());
      repository.removeCourseBookmark.mockResolvedValue(undefined);
      repository.bookmarkLesson.mockResolvedValue(
        createBookmarkRecord({
          lessonId,
          lesson: { title: "Lesson 1" },
        })
      );
      repository.removeLessonBookmark.mockResolvedValue(undefined);
      repository.listBookmarks.mockResolvedValue({
        bookmarks: [createBookmarkRecord(), createBookmarkRecord({ id: "bookmark-lesson", lessonId, lesson: { title: "Lesson 1" } })],
        total: 2,
      });

      // Act
      const courseBookmark = await service.bookmarkCourse(userId, tenantId, courseId);
      await service.removeCourseBookmark(userId, tenantId, courseId);
      const lessonBookmark = await service.bookmarkLesson(userId, tenantId, lessonId);
      await service.removeLessonBookmark(userId, tenantId, lessonId);
      const bookmarks = await service.listBookmarks(userId, tenantId, { page: 1, limit: 10 });

      // Assert
      expect(courseBookmark.type).toBe("course");
      expect(lessonBookmark.type).toBe("lesson");
      expect(bookmarks.total).toBe(2);
      expect(bookmarks.bookmarks.map((bookmark) => bookmark.type)).toEqual(["course", "lesson"]);
    });

    it("should throw when bookmarking a missing lesson", async () => {
      // Arrange
      repository.bookmarkLesson.mockResolvedValue(null);

      // Act & Assert
      await expect(service.bookmarkLesson(userId, tenantId, lessonId)).rejects.toThrow(LearningResourceNotFoundError);
    });
  });

  describe("dashboard", () => {
    it("should map dashboard data", async () => {
      // Arrange
      repository.getDashboard.mockResolvedValue({
        continueLearning: [createProgressRecord()],
        recentlyWatched: [createWatchedLessonRecord()],
        completedLessons: 1,
        completedCourses: 1,
        bookmarkedCourses: 1,
        bookmarkedLessons: 1,
        overallStatistics: {
          watchedLessons: 2,
          totalWatchSeconds: 300,
          averageProgressPercent: 50,
        },
      });

      // Act
      const result = await service.getDashboard(userId, tenantId);

      // Assert
      expect(result.continueLearning).toHaveLength(1);
      expect(result.recentlyWatched).toHaveLength(1);
      expect(result.completedLessons).toBe(1);
      expect(result.overallStatistics.averageProgressPercent).toBe(50);
    });
  });
});
