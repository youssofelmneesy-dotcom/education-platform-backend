import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoriesService } from "../../../src/modules/categories/services/categories.service.js";
import type { ICategoriesRepository } from "../../../src/modules/categories/interfaces/categories-repository.interface.js";
import { DuplicateCategorySlugError, CategoryNotFoundError } from "../../../src/modules/categories/utils/index.js";

import type { Mock } from "vitest";

type MockRepository<T> = {
  [K in keyof T]: Mock;
};

function createRepositoryMock(): MockRepository<ICategoriesRepository> {
  return {
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    updateById: vi.fn(),
    softDeleteById: vi.fn(),
  } as unknown as MockRepository<ICategoriesRepository>;
}

describe("CategoriesService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: CategoriesService;
  const tenantId = "tenant-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new CategoriesService(repository);
    vi.restoreAllMocks();
  });

  describe("create", () => {
    const input = {
      name: "Development",
      slug: "development",
      description: "Software engineering category",
    };

    it("should successfully create a category", async () => {
      // Arrange
      const createdCategory = {
        id: "cat-123",
        tenantId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        deletedAt: null,
      };
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(createdCategory);

      // Act
      const result = await service.create(tenantId, input);

      // Assert
      expect(repository.findBySlug).toHaveBeenCalledWith(input.slug, tenantId);
      expect(repository.create).toHaveBeenCalledWith(tenantId, input);
      expect(result).toEqual({
        id: "cat-123",
        name: input.name,
        slug: input.slug,
        description: input.description,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should throw DuplicateCategorySlugError if slug already exists", async () => {
      // Arrange
      const existingCategory = {
        id: "cat-existing",
        tenantId,
        name: "Existing",
        slug: input.slug,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      repository.findBySlug.mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(service.create(tenantId, input)).rejects.toThrow(DuplicateCategorySlugError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("should return a paginated list of categories", async () => {
      // Arrange
      const categories = [
        {
          id: "cat-1",
          tenantId,
          name: "Category 1",
          slug: "category-1",
          description: "Desc 1",
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          deletedAt: null,
        },
      ];
      repository.list.mockResolvedValue({ categories, total: 1 });

      // Act
      const result = await service.list(tenantId, 1, 10);

      // Assert
      expect(repository.list).toHaveBeenCalledWith(tenantId, 1, 10);
      expect(result).toEqual({
        categories: [
          {
            id: "cat-1",
            name: "Category 1",
            slug: "category-1",
            description: "Desc 1",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getById", () => {
    it("should return category details when found", async () => {
      // Arrange
      const category = {
        id: "cat-123",
        tenantId,
        name: "Category",
        slug: "category",
        description: "Desc",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        deletedAt: null,
      };
      repository.findById.mockResolvedValue(category);

      // Act
      const result = await service.getById("cat-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("cat-123", tenantId);
      expect(result).toEqual({
        id: "cat-123",
        name: "Category",
        slug: "category",
        description: "Desc",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should throw CategoryNotFoundError when category does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById("cat-nonexistent", tenantId)).rejects.toThrow(CategoryNotFoundError);
    });
  });

  describe("updateById", () => {
    const updateData = { name: "New Name", slug: "new-slug" };

    it("should successfully update category details", async () => {
      // Arrange
      const updatedCategory = {
        id: "cat-123",
        tenantId,
        name: updateData.name,
        slug: updateData.slug,
        description: "Desc",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        deletedAt: null,
      };
      repository.findBySlug.mockResolvedValue(null);
      repository.updateById.mockResolvedValue(updatedCategory);

      // Act
      const result = await service.updateById("cat-123", tenantId, updateData);

      // Assert
      expect(repository.findBySlug).toHaveBeenCalledWith(updateData.slug, tenantId);
      expect(repository.updateById).toHaveBeenCalledWith("cat-123", tenantId, updateData);
      expect(result).toEqual({
        id: "cat-123",
        name: updateData.name,
        slug: updateData.slug,
        description: "Desc",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });

    it("should allow keeping the same slug", async () => {
      // Arrange
      const existingWithSameSlug = {
        id: "cat-123",
        tenantId,
        name: "Old Name",
        slug: "same-slug",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const updatedCategory = {
        ...existingWithSameSlug,
        name: "New Name",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      };
      repository.findBySlug.mockResolvedValue(existingWithSameSlug);
      repository.updateById.mockResolvedValue(updatedCategory);

      // Act
      const result = await service.updateById("cat-123", tenantId, { name: "New Name", slug: "same-slug" });

      // Assert
      expect(result.name).toBe("New Name");
    });

    it("should throw DuplicateCategorySlugError if updating to a slug owned by another category", async () => {
      // Arrange
      const existingWithSlug = {
        id: "cat-different",
        tenantId,
        name: "Other",
        slug: "other-slug",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      repository.findBySlug.mockResolvedValue(existingWithSlug);

      // Act & Assert
      await expect(service.updateById("cat-123", tenantId, { slug: "other-slug" })).rejects.toThrow(DuplicateCategorySlugError);
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it("should throw CategoryNotFoundError if category to update is not found", async () => {
      // Arrange
      repository.findBySlug.mockResolvedValue(null);
      repository.updateById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateById("cat-nonexistent", tenantId, updateData)).rejects.toThrow(CategoryNotFoundError);
    });
  });

  describe("deleteById", () => {
    it("should successfully delete category if found", async () => {
      // Arrange
      const category = {
        id: "cat-123",
        tenantId,
        name: "To Delete",
        slug: "to-delete",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      repository.findById.mockResolvedValue(category);
      repository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.deleteById("cat-123", tenantId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith("cat-123", tenantId);
      expect(repository.softDeleteById).toHaveBeenCalledWith("cat-123", tenantId);
    });

    it("should throw CategoryNotFoundError if category to delete does not exist", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteById("cat-nonexistent", tenantId)).rejects.toThrow(CategoryNotFoundError);
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
