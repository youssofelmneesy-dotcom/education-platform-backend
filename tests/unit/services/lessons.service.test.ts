import { beforeEach, describe, expect, it, vi } from "vitest";

import { LessonsService } from "../../../src/modules/lessons/services/lessons.service.js";
import type { ILessonsRepository } from "../../../src/modules/lessons/interfaces/index.js";
import { CourseNotFoundError, DuplicateLessonSlugError, LessonNotFoundError } from "../../../src/modules/lessons/utils/index.js";
import { prisma } from "../../../src/database/index.js";

vi.mock("../../../src/database/index.js", () => ({
  prisma: {
    course: {
      findFirst: vi.fn(),
    },
  },
}));

function createRepositoryMock(): ILessonsRepository & {
  create: ReturnType<typeof vi.fn>;
  listByCourse: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findBySlug: ReturnType<typeof vi.fn>;
  updateById: ReturnType<typeof vi.fn>;
  softDeleteById: ReturnType<typeof vi.fn>;
} {
  return {
    create: vi.fn(),
    listByCourse: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    updateById: vi.fn(),
    softDeleteById: vi.fn(),
  };
}

function createLessonRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "lesson-123",
    tenantId: "tenant-123",
    courseId: "course-123",
    title: "Introduction",
    slug: "introduction",
    description: "Lesson description",
    content: "Lesson content",
    sortOrder: 1,
    durationSeconds: 600,
    isPreview: false,
    publishedAt: new Date("2024-01-03T00:00:00.000Z"),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

describe("LessonsService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: LessonsService;
  const tenantId = "tenant-123";
  const courseId = "course-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new LessonsService(repository);
    vi.mocked(prisma.course.findFirst).mockReset();
  });

  describe("create", () => {
    const input = {
      courseId,
      title: "Introduction",
      slug: "introduction",
      description: "Lesson description",
      content: "Lesson content",
      sortOrder: 1,
      durationSeconds: 600,
      isPreview: false,
    };

    it("should create a lesson when course exists and slug is unique", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue({ id: courseId });
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(createLessonRecord());

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        where: { id: courseId, tenantId, deletedAt: null },
      });
      expect(repository.findBySlug).toHaveBeenCalledWith(input.slug, courseId, tenantId);
      expect(repository.create).toHaveBeenCalledWith(tenantId, input);
      expect(result).toMatchObject({
        id: "lesson-123",
        courseId,
        title: "Introduction",
        slug: "introduction",
        publishedAt: "2024-01-03T00:00:00.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });

    it("should return null publishedAt for unpublished lessons", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue({ id: courseId });
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(createLessonRecord({ publishedAt: null }));

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(result.publishedAt).toBeNull();
    });

    it("should throw CourseNotFoundError when parent course does not exist", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(tenantId, input)).rejects.toThrow(CourseNotFoundError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw DuplicateLessonSlugError when slug already exists in course", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue({ id: courseId });
      repository.findBySlug.mockResolvedValue(createLessonRecord());

      // Act & Assert
      await expect(service.create(tenantId, input)).rejects.toThrow(DuplicateLessonSlugError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("listByCourse", () => {
    it("should return paginated lessons for an existing course", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue({ id: courseId });
      repository.listByCourse.mockResolvedValue({
        lessons: [createLessonRecord({ id: "lesson-1", title: "Lesson 1" })],
        total: 1,
      });

      // Act
      const result = await service.listByCourse(tenantId, courseId, 1, 10, "intro");

      // Assert
      expect(repository.listByCourse).toHaveBeenCalledWith(tenantId, courseId, 1, 10, "intro");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.lessons[0]?.id).toBe("lesson-1");
    });

    it("should throw CourseNotFoundError when listing lessons for a missing course", async () => {
      // Arrange
      vi.mocked(prisma.course.findFirst).mockResolvedValue(null);

      // Act & Assert
      await expect(service.listByCourse(tenantId, courseId, 1, 10)).rejects.toThrow(CourseNotFoundError);
      expect(repository.listByCourse).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return a lesson by id", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createLessonRecord());

      // Act
      const result = await service.getById("lesson-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("lesson-123", tenantId);
      expect(result.id).toBe("lesson-123");
    });

    it("should throw LessonNotFoundError when lesson does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById("missing-lesson", tenantId)).rejects.toThrow(LessonNotFoundError);
    });
  });

  describe("updateById", () => {
    it("should update a lesson without slug lookup when slug is unchanged", async () => {
      // Arrange
      const data = { title: "Updated Lesson", slug: "introduction" };
      repository.findById.mockResolvedValue(createLessonRecord());
      repository.updateById.mockResolvedValue(createLessonRecord({ title: data.title }));

      // Act
      const result = await service.updateById("lesson-123", tenantId, data);

      // Assert
      expect(repository.findBySlug).not.toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith("lesson-123", tenantId, data);
      expect(result.title).toBe("Updated Lesson");
    });

    it("should update a lesson when a new slug is unique", async () => {
      // Arrange
      const data = { slug: "updated-lesson" };
      repository.findById.mockResolvedValue(createLessonRecord());
      repository.findBySlug.mockResolvedValue(null);
      repository.updateById.mockResolvedValue(createLessonRecord({ slug: data.slug }));

      // Act
      const result = await service.updateById("lesson-123", tenantId, data);

      // Assert
      expect(repository.findBySlug).toHaveBeenCalledWith(data.slug, courseId, tenantId);
      expect(result.slug).toBe(data.slug);
    });

    it("should throw DuplicateLessonSlugError when new slug belongs to another lesson", async () => {
      // Arrange
      const data = { slug: "duplicate-lesson" };
      repository.findById.mockResolvedValue(createLessonRecord());
      repository.findBySlug.mockResolvedValue(createLessonRecord({ id: "another-lesson", slug: data.slug }));

      // Act & Assert
      await expect(service.updateById("lesson-123", tenantId, data)).rejects.toThrow(DuplicateLessonSlugError);
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it("should throw LessonNotFoundError when lesson to update does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateById("missing-lesson", tenantId, { title: "Missing" })).rejects.toThrow(LessonNotFoundError);
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it("should throw LessonNotFoundError when repository update returns null", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createLessonRecord());
      repository.updateById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateById("lesson-123", tenantId, { title: "Updated" })).rejects.toThrow(LessonNotFoundError);
    });
  });

  describe("deleteById", () => {
    it("should soft delete an existing lesson", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createLessonRecord());
      repository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.deleteById("lesson-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("lesson-123", tenantId);
      expect(repository.softDeleteById).toHaveBeenCalledWith("lesson-123", tenantId);
    });

    it("should throw LessonNotFoundError when lesson to delete does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteById("missing-lesson", tenantId)).rejects.toThrow(LessonNotFoundError);
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
