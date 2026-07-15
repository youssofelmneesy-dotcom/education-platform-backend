import { beforeEach, describe, expect, it, vi } from "vitest";

import { CoursesService } from "../../../src/modules/courses/services/courses.service.js";
import type { ICoursesRepository } from "../../../src/modules/courses/interfaces/index.js";
import { CourseNotFoundError, DuplicateCourseSlugError } from "../../../src/modules/courses/utils/index.js";

function createRepositoryMock(): ICoursesRepository & {
  create: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findBySlug: ReturnType<typeof vi.fn>;
  updateById: ReturnType<typeof vi.fn>;
  softDeleteById: ReturnType<typeof vi.fn>;
} {
  return {
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    updateById: vi.fn(),
    softDeleteById: vi.fn(),
  };
}

function createCourseRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "course-123",
    tenantId: "tenant-123",
    title: "TypeScript Fundamentals",
    slug: "typescript-fundamentals",
    description: "A complete TypeScript course",
    shortDescription: "Learn TypeScript",
    thumbnailUrl: "https://example.com/thumb.png",
    status: "draft",
    language: "en",
    durationSeconds: 3600,
    publishedAt: new Date("2024-01-03T00:00:00.000Z"),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

describe("CoursesService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: CoursesService;
  const tenantId = "tenant-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new CoursesService(repository);
    vi.restoreAllMocks();
  });

  describe("create", () => {
    const input = {
      title: "TypeScript Fundamentals",
      slug: "typescript-fundamentals",
      description: "A complete TypeScript course",
      shortDescription: "Learn TypeScript",
      thumbnailUrl: "https://example.com/thumb.png",
      status: "draft",
      language: "en",
      durationSeconds: 3600,
    };

    it("should create a course when slug is unique", async () => {
      // Arrange
      const course = createCourseRecord();
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(course);

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(repository.findBySlug).toHaveBeenCalledWith(input.slug, tenantId);
      expect(repository.create).toHaveBeenCalledWith(tenantId, input);
      expect(result).toEqual({
        id: "course-123",
        title: "TypeScript Fundamentals",
        slug: "typescript-fundamentals",
        description: "A complete TypeScript course",
        shortDescription: "Learn TypeScript",
        thumbnailUrl: "https://example.com/thumb.png",
        status: "draft",
        language: "en",
        durationSeconds: 3600,
        publishedAt: "2024-01-03T00:00:00.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });

    it("should return null publishedAt when course is unpublished", async () => {
      // Arrange
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(createCourseRecord({ publishedAt: null }));

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(result.publishedAt).toBeNull();
    });

    it("should throw DuplicateCourseSlugError when slug already exists", async () => {
      // Arrange
      repository.findBySlug.mockResolvedValue(createCourseRecord());

      // Act & Assert
      await expect(service.create(tenantId, input)).rejects.toThrow(DuplicateCourseSlugError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("should return a paginated course list", async () => {
      // Arrange
      repository.list.mockResolvedValue({
        courses: [createCourseRecord({ id: "course-1", title: "Course 1", slug: "course-1" })],
        total: 1,
      });

      // Act
      const result = await service.list(tenantId, 2, 5);

      // Assert
      expect(repository.list).toHaveBeenCalledWith(tenantId, 2, 5, undefined);
      expect(result).toMatchObject({
        total: 1,
        page: 2,
        limit: 5,
        courses: [
          {
            id: "course-1",
            title: "Course 1",
            slug: "course-1",
          },
        ],
      });
    });

    it("should pass search term to repository", async () => {
      // Arrange
      repository.list.mockResolvedValue({ courses: [], total: 0 });

      // Act
      const result = await service.list(tenantId, 1, 10, "typescript");

      // Assert
      expect(repository.list).toHaveBeenCalledWith(tenantId, 1, 10, "typescript");
      expect(result).toEqual({
        courses: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getById", () => {
    it("should return a course by id", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createCourseRecord());

      // Act
      const result = await service.getById("course-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("course-123", tenantId);
      expect(result.id).toBe("course-123");
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should throw CourseNotFoundError when course does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById("missing-course", tenantId)).rejects.toThrow(CourseNotFoundError);
    });
  });

  describe("updateById", () => {
    it("should update a course without slug lookup when slug is not provided", async () => {
      // Arrange
      const data = { title: "Updated Course" };
      repository.updateById.mockResolvedValue(createCourseRecord({ title: data.title }));

      // Act
      const result = await service.updateById("course-123", tenantId, data);

      // Assert
      expect(repository.findBySlug).not.toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith("course-123", tenantId, data);
      expect(result.title).toBe("Updated Course");
    });

    it("should allow updating while keeping the same slug", async () => {
      // Arrange
      const data = { slug: "typescript-fundamentals" };
      repository.findBySlug.mockResolvedValue(createCourseRecord({ id: "course-123" }));
      repository.updateById.mockResolvedValue(createCourseRecord());

      // Act
      const result = await service.updateById("course-123", tenantId, data);

      // Assert
      expect(repository.findBySlug).toHaveBeenCalledWith(data.slug, tenantId);
      expect(repository.updateById).toHaveBeenCalledWith("course-123", tenantId, data);
      expect(result.slug).toBe(data.slug);
    });

    it("should throw DuplicateCourseSlugError when slug belongs to another course", async () => {
      // Arrange
      const data = { slug: "existing-slug" };
      repository.findBySlug.mockResolvedValue(createCourseRecord({ id: "another-course", slug: data.slug }));

      // Act & Assert
      await expect(service.updateById("course-123", tenantId, data)).rejects.toThrow(DuplicateCourseSlugError);
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it("should throw CourseNotFoundError when course to update does not exist", async () => {
      // Arrange
      const data = { title: "Missing Course" };
      repository.updateById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateById("missing-course", tenantId, data)).rejects.toThrow(CourseNotFoundError);
    });
  });

  describe("deleteById", () => {
    it("should soft delete an existing course", async () => {
      // Arrange
      repository.findById.mockResolvedValue(createCourseRecord());
      repository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.deleteById("course-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("course-123", tenantId);
      expect(repository.softDeleteById).toHaveBeenCalledWith("course-123", tenantId);
    });

    it("should throw CourseNotFoundError when course to delete does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteById("missing-course", tenantId)).rejects.toThrow(CourseNotFoundError);
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
